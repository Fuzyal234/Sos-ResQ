export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  export type MiddlewareFunction = (req: Request, res: Response, next: Function) => void;
  