class ApiResponse {
  constructor(statuscode, message = "success", data) {
    this.statuscode = statuscode;
    this.data = data;
    (this.message = message), (this.success = statuscode < 400);
  }
}

export { ApiResponse };
