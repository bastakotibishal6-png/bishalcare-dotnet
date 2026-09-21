import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import './QuizResults.css';

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const results = location.state?.quizResults;

    if (!results) {
      navigate('/skin-quiz');
      return;
    }

    console.log('Quiz Results:', results);
    setQuizResults(results);
  }, [location, navigate]);

  if (!quizResults) {
    return (
      <div className="loading-container-elegant" role="status">
        <div className="spinner-elegant" />
        <p>Curating your personalized routine...</p>
      </div>
    );
  }

  const skinType = quizResults.skinType || 'Normal';
  const concerns = quizResults.concerns || [];
  const recommendations = quizResults.recommendations || [];

  return (
    <main className="quiz-results-page">
      <div className="qr-container">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="qr-hero">
          <div className="qr-hero-eyebrow">
            <span className="qr-eyebrow-line" />
            <span>Personal Beauty Consultation</span>
            <span className="qr-eyebrow-line" />
          </div>

          <span className="qr-hero-subtitle">
            Consultation Complete
          </span>

          <h1 className="qr-hero-title">
            Your Skin,
            <em> Understood.</em>
          </h1>

          <p className="qr-hero-text">
            {quizResults.message ||
              'We have analyzed your skin profile and curated a personalized routine designed around your needs.'}
          </p>

          <div className="qr-hero-status">
            <span className="qr-status-dot" />
            Personalized for your skin profile
          </div>
        </section>

        {/* =====================================================
            SKIN PROFILE
        ====================================================== */}
        <section className="qr-profile-section">
          <div className="qr-profile-main">

            <div className="qr-profile-heading">
              <span className="qr-label">Your Skin Profile</span>

              <div className="qr-profile-number">
                01
              </div>
            </div>

            <div className="qr-profile-content">
              <span className="qr-profile-caption">
                Primary skin type
              </span>

              <h2 className="qr-skin-type">
                {skinType}
              </h2>

              <div className="qr-profile-divider" />

              <p className="qr-description">
                {getSkinTypeDescription(skinType)}
              </p>
            </div>
          </div>

          <div className="qr-profile-details">

            {concerns.length > 0 && (
              <div className="qr-detail-block">
                <div className="qr-detail-top">
                  <span className="qr-label">Primary Concerns</span>
                  <span className="qr-detail-icon">+</span>
                </div>

                <div className="qr-tags">
                  {concerns.map((concern, index) => (
                    <span key={index} className="qr-tag">
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {quizResults.budgetRange && (
              <div className="qr-detail-block">
                <span className="qr-label">Budget Preference</span>

                <div className="qr-text-value">
                  {quizResults.budgetRange}
                </div>
              </div>
            )}

            {quizResults.preferences && (
              <div className="qr-detail-block">
                <span className="qr-label">Routine Preference</span>

                <div className="qr-text-value">
                  {quizResults.preferences}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            EXPERT ADVICE
        ====================================================== */}
        {quizResults.routineAdvice && (
          <section className="qr-expert-advice">
            <div className="qr-advice-inner">

              <div className="qr-advice-mark">
                “
              </div>

              <div className="qr-advice-content">
                <span className="qr-label">
                  A Note For Your Routine
                </span>

                <p>
                  {quizResults.routineAdvice}
                </p>
              </div>

              <div className="qr-advice-signature">
                <span />
                Bisahl Care
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            RECOMMENDATIONS
        ====================================================== */}
        {recommendations.length > 0 && (
          <section className="qr-recommendations">

            <div className="qr-section-header">
              <div className="qr-section-kicker">
                Your Selection
              </div>

              <h2>
                Your Curated Routine
              </h2>

              <p>
                Thoughtfully selected products based on your
                personalized skin profile.
              </p>
            </div>

            <div className="qr-recommendation-list">
              {recommendations.map((rec, index) => (
                <article
                  key={index}
                  className="qr-rec-group"
                >
                  <div className="qr-rec-header">
                    <div className="qr-rec-index">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="qr-rec-heading">
                      <span className="qr-label">
                        Targeting
                      </span>

                      <h3>
                        {rec.concern}
                      </h3>

                      {rec.recommendation && (
                        <p>
                          {rec.recommendation}
                        </p>
                      )}
                    </div>
                  </div>

                  {rec.products && rec.products.length > 0 && (
                    <div className="qr-products-grid">
                      {rec.products.map((product) => (
                        <div
                          key={product.productId}
                          className="qr-product-wrapper"
                        >
                          <div className="qr-match-label">
                            <span className="qr-match-dot" />
                            Recommended for you
                          </div>

                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            SKINCARE GUIDE
        ====================================================== */}
        <section className="qr-tips-section">

          <div className="qr-section-header">
            <div className="qr-section-kicker">
              Daily Ritual
            </div>

            <h2>
              Essential Care Guide
            </h2>

            <p>
              Simple habits to support your{' '}
              {skinType.toLowerCase()} skin every day.
            </p>
          </div>

          <div className="qr-tips-grid">
            {getSkincareTips(skinType).map((tip, index) => (
              <article
                key={index}
                className="qr-tip-card"
              >
                <div className="qr-tip-top">
                  <span className="qr-tip-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="qr-tip-arrow">
                    ↗
                  </span>
                </div>

                <h3>
                  {tip.title}
                </h3>

                <p>
                  {tip.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ====================================================== */}
        <section className="qr-actions">

          <div className="qr-actions-copy">
            <span className="qr-label">
              Your routine is ready
            </span>

            <h2>
              Begin your skincare ritual.
            </h2>

            <p>
              Explore your personalized product selection
              and find what works for your skin.
            </p>
          </div>

          <div className="qr-action-buttons">
            <button
              type="button"
              className="qr-btn qr-btn-primary"
              onClick={() => navigate('/shop')}
            >
              <span>Shop Your Routine</span>
              <span className="qr-btn-arrow">→</span>
            </button>

            <button
              type="button"
              className="qr-btn qr-btn-secondary"
              onClick={() => navigate('/skin-quiz')}
            >
              Retake Consultation
            </button>
          </div>

        </section>

      </div>
    </main>
  );
};


/* ============================================================
   SKIN TYPE DESCRIPTION
============================================================ */

const getSkinTypeDescription = (skinType) => {
  const descriptions = {
    Dry:
      'Your skin tends to feel tight and may show flaky patches. Focus on deep hydration and barrier repair.',

    Oily:
      'Your skin produces excess sebum, especially in the T-zone. Look for oil-free, non-comedogenic products.',

    Combination:
      'You have both dry and oily areas. Balance is key — treat different zones according to their individual needs.',

    Normal:
      'Your skin is well-balanced with few concerns. Maintain its health with gentle, nourishing products.',

    Sensitive:
      'Your skin reacts easily to products or environmental factors. Choose gentle, fragrance-free formulas.'
  };

  return (
    descriptions[skinType] ||
    'Your unique skin type deserves customized care.'
  );
};


/* ============================================================
   SKINCARE TIPS
============================================================ */

const getSkincareTips = (skinType) => {
  const tips = {
    Dry: [
      {
        title: 'Hydrate Deeply',
        description:
          'Use rich moisturizers with hydrating ingredients such as hyaluronic acid and ceramides.'
      },
      {
        title: 'Avoid Hot Water',
        description:
          'Wash with lukewarm water to help minimize unnecessary moisture loss.'
      },
      {
        title: 'Layer Products',
        description:
          'Apply hydrating products before moisturizer to build a comfortable routine.'
      }
    ],

    Oily: [
      {
        title: 'Cleanse Gently',
        description:
          'Use a gentle cleanser morning and night without over-cleansing your skin.'
      },
      {
        title: "Don't Skip Moisturizer",
        description:
          'Choose lightweight hydration that feels comfortable on oilier areas.'
      },
      {
        title: 'Exfoliate Mindfully',
        description:
          'If suitable for your skin, incorporate gentle chemical exfoliation into your routine.'
      }
    ],

    Combination: [
      {
        title: 'Treat Different Zones',
        description:
          'Pay attention to the different needs of oily and dry areas of your face.'
      },
      {
        title: 'Choose Lightweight Hydration',
        description:
          'Look for comfortable moisturizers that hydrate without feeling heavy.'
      },
      {
        title: 'Target Specific Concerns',
        description:
          'Use targeted products according to what each area of your skin needs.'
      }
    ],

    Normal: [
      {
        title: 'Maintain Balance',
        description:
          'Keep your routine simple, consistent and comfortable for your skin.'
      },
      {
        title: 'Protect Daily',
        description:
          'Consider antioxidants and daily SPF as part of your regular skincare routine.'
      },
      {
        title: 'Listen to Your Skin',
        description:
          'Adjust your products and routine as your skin changes throughout the year.'
      }
    ],

    Sensitive: [
      {
        title: 'Patch Test',
        description:
          'Test new products on a small area before introducing them into your routine.'
      },
      {
        title: 'Keep It Gentle',
        description:
          'Choose simple formulas and avoid ingredients that you know your skin dislikes.'
      },
      {
        title: 'Soothe & Protect',
        description:
          'Look for gentle, soothing ingredients and maintain a consistent routine.'
      }
    ]
  };

  return tips[skinType] || tips.Normal;
};

export default QuizResults;