/**
 * Nav logo: the BETTERPITCH wordmark in a bold condensed face, two-tone in the
 * site theme (dark + brand orange), recoloured by `.nav.white` over the heroes.
 */
export default function Logo({ href = '/', className = 'nav__logo' }) {
  return (
    <a className={className} href={href} aria-label="Better Pitch home">
      <span className="__wordmark" aria-hidden="true">
        <span className="--better">Better</span>
        <span className="--pitch">Pitch</span>
      </span>
    </a>
  );
}
