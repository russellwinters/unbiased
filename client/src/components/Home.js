import React from "react";

export default function Home() {
  return (
    <section className="home">
      <h2 className="home-title">Home</h2>
      <div className="home-quote">
        <p className="home-quote__content">
          Confrontation focuses our emotional energies on the singular goal of
          winning over the other side. As we become consumed in this mindset, we
          reenact partisan patterns of conflict that may comfort our fears but
          undermine cooperation.
        </p>
        <span className="home-quote__reference">- Daniel Shapiro</span>
      </div>
      <div className="home-about">
        <p className="home-about__content">
          Unbiased is an app that wants to pull you out of the divisive mindset
          politics have pushed on our culture. The app pulls in news from a
          variety of sources, with the goal of presenting ALL media bias - not
          one single bias that leans left or right.
        </p>
        <p className="home-about__content">
          The goal of Unbiased is not to persuade anybody that one political
          side is correct. Instead, it's intention is to present each side of
          the media.
        </p>
        <p className="home-about__content">
          Hopefully, if we're willing to read other news outlets we will also
          become more willing to talk to those who differ in perspective -
          instead of just tweeting at them.
        </p>
      </div>
    </section>
  );
}
