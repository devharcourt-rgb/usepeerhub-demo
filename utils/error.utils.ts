import { HTTPStatus } from "./http.utils";

class HTTPException extends Error {
  statusCode: HTTPStatus;

  constructor(statusCode: HTTPStatus, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default HTTPException;
