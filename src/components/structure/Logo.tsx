// Brand wordmark — condensed Archivo "AuraOne" with a section-coloured blob mark.

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  iconOnly?: boolean;
  textOnly?: boolean;
}

const Logo = ({
  className = '',
  iconClassName = 'w-8 h-8',
  textClassName = 'text-[26px]',
  iconOnly = false,
  textOnly = false
}: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!textOnly && (
        <span
          aria-hidden="true"
          className={`lm-blob inline-block flex-none ${iconClassName}`}
          style={{ animation: 'none', borderRadius: '62% 38% 54% 46% / 52% 60% 40% 48%' }}
        />
      )}

      {!iconOnly && (
        <span
          className={`${textClassName} font-extrabold text-ink`}
          style={{ letterSpacing: '-.05em', fontStretch: '78%' }}
        >
          AuraOne
        </span>
      )}
    </div>
  );
};

export default Logo;
