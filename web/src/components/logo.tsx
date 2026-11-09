interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 100, className = '' }: LogoProps) {
  return (
    <img
      width={size}
      height={size}
      className={className}
      alt=""

      src="/assets/logo.png"
    />
  )
}
