import VideoWrapper from '../VideoWrapper/VideoWrapper';

/** One numbered walkthrough step; `side` flips the media/copy order. */
export default function HowBlock({ step, side, video, poster, title, copy }) {
  return (
    <div className={`--block ${side}`}>
      <div className="--img">
        <span data-speed="1.3">{step}</span>
        <VideoWrapper src={video} poster={poster} />
      </div>
      <div className="--text">
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
    </div>
  );
}
