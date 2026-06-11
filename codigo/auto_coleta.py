import argparse
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
CARRO_SCRIPT = BASE_DIR / "codigo" / "carro.py"
JSON_RELATIVE_PATH = "mapa_calor.json"
INTERVAL_SECONDS = int(os.getenv("INTERVALO_COLETA_SEGUNDOS", "300"))
MAX_ATTEMPTS = int(os.getenv("TENTATIVAS_COLETA", "3"))
RETRY_DELAY_SECONDS = int(os.getenv("INTERVALO_TENTATIVA_SEGUNDOS", "10"))
COMMAND_TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_COMANDO_SEGUNDOS", "90"))


def run_command(command: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    try:
        result = subprocess.run(
            command,
            cwd=BASE_DIR,
            text=True,
            capture_output=True,
            timeout=COMMAND_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired as exc:
        output = exc.stderr or exc.stdout or ""
        message = f"Comando excedeu timeout de {COMMAND_TIMEOUT_SECONDS}s: {' '.join(command)}"
        if output:
            message = f"{message}\n{output.strip()}"
        if check:
            raise RuntimeError(message) from exc
        return subprocess.CompletedProcess(command, 124, exc.stdout, message)

    if check and result.returncode != 0:
        output = result.stderr.strip() or result.stdout.strip()
        raise RuntimeError(f"Comando falhou: {' '.join(command)}\n{output}")

    return result


def collect_traffic_data() -> None:
    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        result = run_command([sys.executable, str(CARRO_SCRIPT)], check=False)
        if result.returncode == 0:
            return

        output = result.stderr.strip() or result.stdout.strip()
        last_error = RuntimeError(
            f"Tentativa {attempt}/{MAX_ATTEMPTS} falhou ao coletar dados.\n{output}"
        )
        if attempt < MAX_ATTEMPTS:
            time.sleep(RETRY_DELAY_SECONDS)

    if last_error is not None:
        raise last_error

    raise RuntimeError("Nenhuma tentativa de coleta foi executada.")


def has_json_changes() -> bool:
    result = run_command(["git", "status", "--porcelain", "--", JSON_RELATIVE_PATH])
    return bool(result.stdout.strip())


def commit_and_push_json() -> None:
    if not has_json_changes():
        print("Sem mudancas em mapa_calor.json. Push ignorado.", flush=True)
        return

    run_command(["git", "add", JSON_RELATIVE_PATH])

    diff_result = run_command(
        ["git", "diff", "--cached", "--quiet", "--", JSON_RELATIVE_PATH],
        check=False,
    )
    if diff_result.returncode == 0:
        print("Sem mudancas staged em mapa_calor.json. Push ignorado.", flush=True)
        return
    if diff_result.returncode != 1:
        raise RuntimeError("Nao foi possivel verificar o diff staged do JSON.")

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    run_command(["git", "commit", "-m", f"Atualiza mapa_calor.json {timestamp}"])

    branch = run_command(["git", "branch", "--show-current"]).stdout.strip()
    if not branch:
        raise RuntimeError("Branch atual nao encontrada.")

    run_command(["git", "push", "-u", "origin", branch])
    print(f"mapa_calor.json enviado para origin/{branch}.", flush=True)


def run_cycle() -> None:
    print(datetime.now().strftime("[%Y-%m-%d %H:%M:%S] Iniciando coleta..."), flush=True)
    collect_traffic_data()
    commit_and_push_json()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Executa apenas uma coleta.")
    args = parser.parse_args()

    while True:
        try:
            run_cycle()
        except Exception as exc:
            print(f"Erro na automacao: {exc}", file=sys.stderr, flush=True)
            if args.once:
                return 1

        if args.once:
            return 0

        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())
