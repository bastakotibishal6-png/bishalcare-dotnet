import React from 'react';
import { FaLeaf, FaPaw, FaSeedling, FaFlask } from 'react-icons/fa';
import './About.css';

const VALUES = [
  {
    icon: FaLeaf,
    title: 'Sustainability First',
    text: 'We are committed to reducing our environmental impact through eco-conscious packaging, sustainable sourcing, and carbon-neutral shipping.',
  },
  {
    icon: FaPaw,
    title: '100% Cruelty-Free',
    text: 'No animal testing. Ever. We work exclusively with suppliers who share our commitment to animal welfare.',
  },
  {
    icon: FaSeedling,
    title: 'Vegan Formulas',
    text: "All our products are completely free from animal-derived ingredients. Beauty that's kind to all living beings.",
  },
  {
    icon: FaFlask,
    title: 'Efficacy Matters',
    text: "Clean doesn't mean compromise. Our formulations deliver professional-grade results with premium, performance-driven ingredients.",
  },
];

const STATS = [
  { value: '100%', label: 'Vegan & Cruelty-Free' },
  { value: '152+', label: 'Premium Products' },
  { value: '0', label: 'Animal Testing' },
  { value: 'Pokhara', label: 'Based in Nepal' },
];

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero" data-aos="fade-in">
        <div className="container">
          <h1 data-aos="fade-up">About Bishal Care</h1>
          <p className="about-hero__subtitle" data-aos="fade-up" data-aos-delay="200">
            Where luxury meets conscious beauty
          </p>
        </div>
      </section>

      <section className="about-section about-story">
        <div className="container">
          <div className="about-story__grid">
            <div className="about-story__text" data-aos="fade-right">
              <h2>Our Story</h2>
              <p>
                Bishal Care was born from a vision to redefine luxury beauty.
                In a world where premium skincare and makeup often come at the
                cost of our planet and its creatures, we dared to dream differently.
              </p>
              <p>
                Founded in Pokhara in 2026, Bishal Care represents the future of beauty -
                where high-performance formulations meet uncompromising ethics.
              </p>
              <p>
                Every product in our curated collection is 100% vegan, cruelty-free,
                and formulated with premium ingredients that deliver visible results.
                We believe you shouldn't have to choose between efficacy and ethics.
              </p>
            </div>

            <div className="about-story__media" data-aos="fade-left">
              <img
                src={require('../assets/images/logo-full.png')}
                alt="Bishal Care Logo"
                className="about-story__logo"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-section--tinted about-values">
        <div className="container">
          <h2 className="about-section__title" data-aos="fade-up">Our Core Values</h2>

          <div className="about-values__grid">
            {VALUES.map(({ icon: Icon, title, text }, index) => (
              <div
                className="about-values__item"
                key={title}
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 100}
              >
                <div className="about-values__card">
                  <span className="about-values__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-mission">
        <div className="container">
          <div className="about-mission__content" data-aos="fade-up">
            <h2>Our Mission</h2>
            <p>
              To revolutionize the beauty industry by proving that luxury, performance,
              and ethics can coexist. We're building a future where every beauty ritual
              is a conscious choice - one that nourishes your skin while respecting our planet.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section about-section--tinted about-stats">
        <div className="container">
          <div className="about-stats__grid">
            {STATS.map(({ value, label }, index) => (
              <div
                className="about-stat"
                key={label}
                data-aos="zoom-in"
                data-aos-delay={(index + 1) * 100}
              >
                <span className="about-stat__value">{value}</span>
                <span className="about-stat__label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;