import Image from 'next/image';

export default function AdminIcon() {
  return (
    <Image
      src="/tunadao-logo.svg"
      alt="Tunadão"
      width={24}
      height={24}
      unoptimized
      className="tunadao-admin-icon"
    />
  );
}
