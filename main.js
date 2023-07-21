document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://api.pontomais.com.br/external_api/v1/reports/time_cards";
    const accessToken = "$2a$12$el1yTj9mFqRBu04InJXQdedZDhTaemudc.HmLRfR9YuiK4TO0qvIu";

    // Función para obtener la fecha actual en formato "YYYY-MM-DD"
    function getCurrentDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Función para obtener los datos de las fichadas
    async function fetchTimeCardsData() {
        const startDate = getCurrentDate();
        const endDate = getCurrentDate();

        const requestData = {
            report: {
                start_date: startDate,
                end_date: endDate,
                group_by: "employee",
                row_filters: "",
                columns: "employee_name,pis,date,time,device_description",
                format: "json"
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "access-token": accessToken
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Error al obtener los datos 1: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();

            // Verificar que la respuesta contenga los datos esperados
            if (!Array.isArray(responseData.data)) {
                throw new Error("La respuesta de la API no contiene los datos esperados.");
            }

            console.log("Datos recibidos:", responseData.data[0]);

            createGrid(responseData.data);
        } catch (error) {
            console.error("Error al obtener los datos:", error);

            // Obtener la respuesta completa de la API
            const responseText = await response.text();
            console.error("Respuesta de la API:", responseText);

            // Verificar si la respuesta es un JSON válido
            try {
                const responseData = JSON.parse(responseText);
                console.error("Datos recibidos:", responseData);
            } catch (jsonError) {
                console.error("Error al analizar la respuesta JSON:", jsonError);
            }
        }
    }

    // Función para crear la grilla de fichadas
    function createGrid(timeCardsData) {
        console.log("Comedor Fichadas:", timeCardsData);

        // Aquí puedes implementar la lógica para crear la grilla con los datos recibidos
        // Por ejemplo, puedes usar una librería de visualización de datos como "ag-Grid" o "DataTables"
        // y mostrar los datos en una tabla HTML.

        // Ejemplo de cómo crear una tabla HTML con los datos:
        const tableBody = document.getElementById("table-body");
        tableBody.innerHTML = "";

        const allData = [];

        timeCardsData.forEach((recordArray) => {
            recordArray.forEach((record) => {
                allData.push(...record.data);
            });
        });

        const filteredData = allData.filter((dataRecord) => {
            return dataRecord.device_description === "TABLET COMEDOR";
        });

        filteredData.sort((a, b) => {
            const timeA = a.time;
            const timeB = b.time;
            return timeB.localeCompare(timeA);
        });

        filteredData.forEach((dataRecord) => {
            const row = document.createElement("tr");

            // Obtener la fecha en formato "dd/mm/yyyy" a partir de la cadena "Sex, 21/07/2023"
            const dateString = dataRecord.date.split(", ")[1];
            const [day, month, year] = dateString.split("/");
            const formattedDate = `${day}/${month}/${year}`;

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${dataRecord.time}</td>
                <td>${dataRecord.employee_name}</td>
                <td>${dataRecord.device_description}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Obtener los datos al cargar la página 
    fetchTimeCardsData();

    // Actualizar los datos cada 5 segundos
    setInterval(fetchTimeCardsData, 5000);
});