export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  transformation?: Array<Record<string, any>>;
  format?: string;
  resource_type?: string;
  [key: string]: any; // permet des options supplémentaires
}
