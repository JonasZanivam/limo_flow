type ContractTemplateVars = {
  brideName: string;
  groomName: string;
  weddingDate: string;
  value: string;
  hours: string;
  vehicle: string;
  church: string;
  venue: string;
};

export function buildContractContent(vars: ContractTemplateVars): string {
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE LIMOUSINE

CONTRATANTE: ${vars.brideName} e ${vars.groomName}
DATA DO EVENTO: ${vars.weddingDate}
LOCAL: Igreja ${vars.church} | Salão ${vars.venue}

CONTRATADA: LimoFlow Serviços de Limousine Ltda.

CLÁUSULA 1 — DO OBJETO
A CONTRATADA se compromete a prestar serviço de transporte em limousine para o casamento dos CONTRATANTES, com duração de ${vars.hours} hora(s), utilizando o veículo ${vars.vehicle}.

CLÁUSULA 2 — DO VALOR
O valor total do serviço é de R$ ${vars.value}, podendo ser pago em sinal e saldo conforme acordado comercialmente.

CLÁUSULA 3 — DAS OBRIGAÇÕES
A CONTRATADA disponibilizará motorista habilitado, veículo limpo e decorado conforme combinado. Os CONTRATANTES devem informar horários e locais com antecedência.

CLÁUSULA 4 — DO FORO
Fica eleito o foro da comarca da sede da CONTRATADA para dirimir quaisquer dúvidas oriundas deste contrato.

Por estarem de acordo, firmam o presente contrato.

___________________________          ___________________________
CONTRATANTE                          CONTRATADA`;
}
