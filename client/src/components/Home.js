import React from "react";
import Footer from "./Footer";

export default function Home() {
  return (
    <>
      <section className="home">
        <div className="home-page">
          <h2 className="home-page__title">Home</h2>
          <div className="home-page__quote">
            <p className="home-page__quote-content">
              Confrontation focuses our emotional energies on the singular goal
              of winning over the other side. As we become consumed in this
              mindset, we reenact partisan patterns of conflict that may comfort
              our fears but undermine cooperation.
            </p>
            <span className="home-page__quote-content">- Daniel Shapiro</span>
          </div>
        </div>
        <div className="home-about">
          <p className="home-about__content">
            Unbiased is an app that wants to pull you out of the divisive
            mindset politics have pushed on our culture. The app pulls in news
            from a variety of sources, with the goal of presenting ALL media
            bias - not one single bias that leans left or right.
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
      <Footer />
    </>
  );
}
