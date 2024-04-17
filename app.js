const https = require("https");
const fs = require("fs");

let access_token = "";

/**
 * Makes an HTTPS request to a specified API endpoint.
 * @param {string} api - The API endpoint to call.
 * @param {Object} params - Optional parameters to include in the request body.
 * @returns {Promise<Object>} A promise that resolves with the response data.
 */
function callServer(api, params) {
  return new Promise((resolve, reject) => {
    const postData = params ? JSON.stringify(params) : null;
    const url = "https://production.ez2xs.com/call/" + api;
    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
    };

    if (/^[a-zA-Z0-9_./+-]+$/.test(access_token)) {
      headers["Authorization"] = "Bearer " + access_token;
    }

    const options = {
      method: postData ? "PUT" : "GET",
      headers: headers,
    };

    const req = https.request(url, options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        resolve({
          data: data.length > 0 && JSON.parse(data),
          status: response.statusCode,
          headers: response.headers,
        });
      });
    });

    if (req) {
      req.on("error", reject);

      if (postData) {
        req.write(postData);
      }

      req.end();
    }
  });
}

callServer("api.Auth.Login.login", { login: "test", password: "Hhj46Gj6" })
  .then((loginResponse) => {
    access_token = loginResponse.data.access_token;
    return callServer("api.Relatiebeheer.Niveau9.list", {});
  })
  .then((listResponse) => {
    console.log("Generating the HTML Table");
    const list = listResponse.data.list;
    const tableHeaders = [
      "Last Name",
      "First Name",
      "Function Name",
      "Email",
      "Address",
    ];

    // Generate HTML table from response data
    let tableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
      </style>
      </head>
      <body>
      <table style="width:100%">
      <thead>
        <tr>
          ${tableHeaders
            .map(
              (header, index, arr) =>
                `<th${
                  index === arr.length - 1 ? ' colspan="2"' : ""
                }>${header}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (item) => `
          <tr>
            <td>${item.naam}</td>
            <td>${item.firstname}</td>
            <td>${item.functienaam}</td>
            <td>${item.email}</td>
            <td>${item.adres}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      </table>
      </body>
      </html>
    `;

    // Write generated HTML table to file
    fs.writeFile("output.html", tableHtml, (err) => {
      if (err) {
        console.error("Error writing HTML file:", err);
      } else {
        console.log("HTML file generated: output.html");
      }
    });
  })
  .catch((error) => {
    console.log("Error:", error);
  });

// Export the callServer function for external use
module.exports = { callServer };
