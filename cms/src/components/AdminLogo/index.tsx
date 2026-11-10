import Image from 'next/image';

export default function AdminLogo() {
  return (
    <Image
      src="/tunadao-logo.svg"
      alt="Tunadão 1998"
      width={160}
      height={160}
      unoptimized
      priority
      className="tunadao-admin-logo"
    />
  );
}
