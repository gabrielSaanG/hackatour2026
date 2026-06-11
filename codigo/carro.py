import json

import requests


bbox_trinacional = "-54.70,-25.70,-54.35,-25.35"

url = f"https://data.traffic.hereapi.com/v7/flow?in=bbox:{bbox_trinacional}&locationReferencing=shape&apiKey=EPBvlDg90cS66HEbeUHRpqP62jv5LHNxQXXMVsmDhK8"


print("Buscando dados de transito em tempo real...")
resposta = requests.get(url, timeout=30)
resposta.raise_for_status()
dados = resposta.json()

faixas_de_rolamento = 2

nome_arquivo = "mapa_calor.json"
registros = []

for via in dados.get("results", []):
    nome_rua = via["location"].get("description", "Via sem Nome")
    tamanho_trecho = via["location"]["length"]
    jam_factor = via["currentFlow"]["jamFactor"]

    if jam_factor >= 7.0:
        espaco_por_carro = 7
    elif jam_factor >= 4.0:
        espaco_por_carro = 20
    else:
        espaco_por_carro = 50

    estimativa_total_carros = (tamanho_trecho / espaco_por_carro) * faixas_de_rolamento

    pontos_da_via = []
    if "shape" in via["location"] and "links" in via["location"]["shape"]:
        for link in via["location"]["shape"]["links"]:
            if "points" in link:
                pontos_da_via.extend(link["points"])

    if pontos_da_via:
        quantidade_de_pontos = len(pontos_da_via)
        peso_por_ponto = estimativa_total_carros / quantidade_de_pontos

        for pt in pontos_da_via:
            if peso_por_ponto > 0:
                registros.append({
                    "lat": pt["lat"],
                    "lng": pt["lng"],
                    "peso_carros_ponto": round(peso_por_ponto, 2),
                    "jam_factor": jam_factor,
                    "rua": nome_rua,
                })

with open(nome_arquivo, mode="w", encoding="utf-8") as arquivo_json:
    json.dump(registros, arquivo_json, ensure_ascii=False, indent=2)

print(f"Pronto! Arquivo '{nome_arquivo}' gerado com precisao volumetrica.")
