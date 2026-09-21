import { ArrowRightIcon } from '../icons/Icons';
import './CtaButton.css';

/**
 * The pill button used across the site. On hover the label slides right into
 * the space the right-hand arrow vacates, while a second arrow scales in from
 * the left — hence the two arrow spans.
 *
 * `variant` maps to the original modifier classes: "white" | "secondary".
 * Without an `href` it renders a `<button>` for in-page actions.
 */
export default function CtaButton({ href, children, variant = '', className = '', ...rest }) {
  const classes = ['cta-button', variant, className].filter(Boolean).join(' ');
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href } : { type: 'button' };

  return (
    <Tag className={classes} {...tagProps} {...rest}>
      <span className="cta-button__arrow-left">
        <ArrowRightIcon />
      </span>
      <span className="cta-button__text">{children}</span>
      <span className="cta-button__arrow-right">
        <ArrowRightIcon />
      </span>
    </Tag>
  );
}
