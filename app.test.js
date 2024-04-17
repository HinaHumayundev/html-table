const { callServer } = require("./app.js");
const https = require("https");

jest.mock("https");

describe("callServer function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should make a PUT request with correct params and handle successful response", async () => {
    const mockResponseData = { access_token: "mockAccessToken" };

    https.request.mockImplementation((url, options, callback) => {
      const mockResponse = {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        on: jest.fn((event, handler) => {
          if (event === "data") {
            handler(JSON.stringify(mockResponseData));
          }
          if (event === "end") {
            handler();
          }
        }),
      };
      callback(mockResponse);
      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };
    });

    const api = "api.Auth.Login.login";
    const params = { login: "test", password: "Hhj46Gj6" };

    const response = await callServer(api, params);

    expect(https.request).toHaveBeenCalledWith(
      "https://production.ez2xs.com/call/api.Auth.Login.login",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      },
      expect.any(Function)
    );

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockResponseData);
  });

  it("should make a GET request if no params are provided", async () => {
    const mockResponseData = { list: [{ name: "John", age: 30 }] };

    https.request.mockImplementation((url, options, callback) => {
      const mockResponse = {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        on: jest.fn((event, handler) => {
          if (event === "data") {
            handler(JSON.stringify(mockResponseData));
          }
          if (event === "end") {
            handler();
          }
        }),
      };
      callback(mockResponse);
      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };
    });

    const api = "api.Relatiebeheer.Niveau9.list";
    const response = await callServer(api);

    expect(https.request).toHaveBeenCalledWith(
      "https://production.ez2xs.com/call/api.Relatiebeheer.Niveau9.list",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      },
      expect.any(Function)
    );

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockResponseData);
  });

  it("should handle error if request fails", async () => {
    const errorMessage = "Request failed";

    https.request.mockImplementation((url, options, callback) => {
      const req = {
        on: jest.fn((event, handler) => {
          if (event === "error") {
            handler(new Error(errorMessage));
          }
        }),
        write: jest.fn(),
        end: jest.fn(),
      };

      req.on("error", (error) => {
        callback({ on: jest.fn(), write: jest.fn(), end: jest.fn() });
      });

      return req;
    });

    const api = "api.Auth.Login.login";
    const params = { login: "test", password: "Hhj46Gj6" };

    await expect(callServer(api, params)).rejects.toThrow(errorMessage);

    expect(https.request).toHaveBeenCalledWith(
      "https://production.ez2xs.com/call/api.Auth.Login.login",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      },
      expect.any(Function)
    );
  });
});
