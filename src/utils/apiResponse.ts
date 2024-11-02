export class ApiResponse {
  public success: boolean;
  public data?: any;
  public message: string;
  public status: number;

  constructor(success: boolean, message: string, status: number, data?: any) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.status = status;
  }

  static success(
    data: any,
    message: string = "Success",
    status: number
  ): ApiResponse {
    return new ApiResponse(true, message, status, data);
  }

  static failure(message: string, status: number): ApiResponse {
    const msg: string = `${status}`.startsWith("4") ? "Failure" : "Error";

    return new ApiResponse(false, message ?? msg, status, null);
  }
}
