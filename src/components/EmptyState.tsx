interface Props {
  message: string;
}

export default function EmptyState({ message }: Props) {
  return <p className="text-center">{message}</p>;
}
