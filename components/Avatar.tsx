type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, alt = "", name, size = "md" }: AvatarProps) {
  if (src) {
    return <img className={`avatar avatar-${size}`} src={src} alt={alt} loading="lazy" decoding="async" />;
  }
  return (
    <span className={`avatar avatar-placeholder avatar-${size}`} aria-label={name}>
      {name ? initials(name) : null}
    </span>
  );
}
