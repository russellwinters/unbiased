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
            As an American, I find it extremely frustrating how fragmented and
            divided the public news is. My news all comes from the same source
            and that has been the case for years. It's frustrating to me because
            this news I read is inherently biased. I think this is a problem
            that cannot apply to myself only, so I tried to think of a larger
            solution than simply reading more news sources. Unbiased is a news
            app that presents news from a variety of sources - picked based on
            the amount of factual reporting and limited to sources with minimal
            bias.
          </p>
          <p className="home-about__content">
            The goal of Unbiased is not to persuade anybody that one political
            side is correct. Instead, its intention is to provide access to each
            side of the media.
          </p>
          <p className="home-about__content">
            Hopefully, if we're willing to read other news outlets we will also
            become more willing to talk to those who differ in perspective. At
            that point we can begin to resolve partisan conflict.
          </p>
        </div>
      </section>
      <div className="home-footer">
        <Footer />
      </div>
    </>
  );
}
