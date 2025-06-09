export async function createPassAction(prevState: any, formData: FormData) {
	const email = formData.get("email") as string
	const classId = formData.get("classId") as string
	const title = formData.get("title") as string
	const validity = formData.get("validity") as string
	const date = formData.get("date") as string
  
	const payload = {
	  email,
	  classId,
	  cardInfo: {
		hexBackgroundColor: "#4285f4",
		cardTitle: { defaultValue: { language: "pt-BR", value: title } },
		subheader: { defaultValue: { language: "pt-BR", value: "Visitante" } },
		header: { defaultValue: { language: "pt-BR", value: email || "Usuário" } },
		heroImage: {
		  sourceUri: {
			uri: "https://qrtech.com.br/wp-content/uploads/2023/04/multi-clubes.png"
		  }
		},
		textModulesData: [
		  { header: "Data", body: date, id: "date" },
		  { header: "Válido até", body: validity, id: "validity" }
		]
	  }
	}
  
	try {
	  const res = await fetch("/api/wallet/object", {
		method: "POST",
		body: JSON.stringify(payload),
		headers: { "Content-Type": "application/json" }
	  })
  
	  const data = await res.json()
	  if (res.ok) return { saveUrl: data.saveUrl, error: "" }
	  else return { saveUrl: "", error: data.error || "Erro desconhecido" }
	} catch (e) {
	  return { saveUrl: "", error: "Erro de rede ou servidor." }
	}
  }