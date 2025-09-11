interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  return <p className="text-center text-red-600">{message}</p>;
}
