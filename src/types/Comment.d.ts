export default interface Comment {
  username: string;
  email?: string;
  url?: string;
  content: string;
  avatar?: string;
  date: number;
}
