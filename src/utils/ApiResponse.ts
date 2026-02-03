export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data: T;

  constructor(data: T, message: string = "Success") {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}
