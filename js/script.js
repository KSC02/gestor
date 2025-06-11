const card = document.getElementById("card");
const toRegister = document.getElementById("toRegister");
const toLogin = document.getElementById("toLogin");

toRegister.addEventListener("click", () => {
  card.style.transform = "rotateY(180deg)";
});

toLogin.addEventListener("click", () => {
  card.style.transform = "rotateY(0deg)";
});

// Registro sin recarga
const registroForm = document.querySelector(".back form");

registroForm.addEventListener("submit", async function(e) {
  e.preventDefault(); // Evita recarga

  const formData = new FormData(registroForm);

  try {
    const response = await fetch("./php/registro.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    mostrarMensaje(data.message, data.success);

    // Opcional: si fue exitoso, volver al login tras 2 segundos
    if (data.success) {
      setTimeout(() => {
        document.getElementById("card").style.transform = "rotateY(0deg)";
      }, 2000);
    }

  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor.", false);
  }
});

function mostrarMensaje(mensaje, success ) {
  let mensajeDiv = document.querySelector("#mensajeRegistro");

  if (!mensajeDiv) {
    mensajeDiv = document.createElement("div");
    mensajeDiv.id = "mensajeRegistro";
    registroForm.appendChild(mensajeDiv);
  }

  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.color = success ? "#00ff99" : "#ff5050";
  mensajeDiv.style.marginTop = "10px";
  mensajeDiv.style.textAlign = "center";
  mensajeDiv.style.fontWeight = "bold";
}
