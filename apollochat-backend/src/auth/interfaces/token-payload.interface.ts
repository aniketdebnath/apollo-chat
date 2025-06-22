// Define a more focused TokenPayload that doesn't include status
export interface TokenPayload {
  _id: string;
  email: string;
  username: string;
  imageUrl?: string;
}
