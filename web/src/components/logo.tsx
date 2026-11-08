interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 100, className: _className = '' }: LogoProps) {
  return (
    <img
      width={size}
      height={size}

      src="/assets/logo.png"
    />
  )
}
