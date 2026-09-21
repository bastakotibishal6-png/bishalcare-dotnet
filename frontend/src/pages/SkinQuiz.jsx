import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import './SkinQuiz.css';

const SkinQuiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState({
    skinType: '',
    concerns: [],
    budgetRange: '',
    preferences: []
  });
  const [loading, setLoading] = useState(false);

  const handleSkinTypeSelect = (type) => {
    setQuizData({ ...quizData, skinType: type });
  };

  const handleConcernToggle = (concern) => {
    const concerns = quizData.concerns.includes(concern)
      ? quizData.concerns.filter(c => c !== concern)
      : [...quizData.concerns, concern];
    setQuizData({ ...quizData, concerns });
  };

  const handleBudgetSelect = (budget) => {
    setQuizData({ ...quizData, budgetRange: budget });
  };

  const handlePreferenceToggle = (preference) => {
    const preferences = quizData.preferences.includes(preference)
      ? quizData.preferences.filter(p => p !== preference)
      : [...quizData.preferences, preference];
    setQuizData({ ...quizData, preferences });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const preferencesString = quizData.preferences.length > 0 
        ? quizData.preferences.join(', ') 
        : 'No preference';

      const response = await quizAPI.submitQuiz({
        skinType: quizData.skinType,
        concerns: quizData.concerns,
        budgetRange: quizData.budgetRange,
        preferences: preferencesString 
      });

      console.log('Backend response:', response.data); 

      localStorage.setItem('lastQuizData', JSON.stringify(quizData));
      
      navigate('/quiz-results', { 
        state: { quizResults: response.data } 
      });

    } catch (error) {
      console.error('Quiz error:', error);
      alert('Failed to submit consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return quizData.skinType !== '';
      case 2: return quizData.concerns.length > 0;
      case 3: return quizData.budgetRange !== '';
      case 4: return true; 
      default: return false;
    }
  };

  return (
    <div className="sq-page">
      <div className="sq-container">
        
        {/* PROGRESS SECTION */}
        <div className="sq-progress-wrapper" data-aos="fade-down">
          <span className="sq-progress-label">Consultation</span>
          <div className="sq-progress-bar">
            <div 
              className="sq-progress-fill" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <p className="sq-step-indicator">Step {step} <span className="sq-step-total">/ 4</span></p>
        </div>

        {/* QUIZ CONTENT (Key triggers re-animation on step change) */}
        <div className="sq-content" key={`step-${step}`}>
          
          {step === 1 && (
            <div className="sq-step-container">
              <h2 className="sq-step-title">What is your skin type?</h2>
              <p className="sq-step-subtitle">Select the option that best describes your baseline skin.</p>
              
              <div className="sq-grid">
                {['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'].map(type => (
                  <button
                    key={type}
                    className={`sq-card ${quizData.skinType === type ? 'sq-card-active' : ''}`}
                    onClick={() => handleSkinTypeSelect(type)}
                  >
                    <h3 className="sq-card-title">{type}</h3>
                    <p className="sq-card-desc">
                      {type === 'Oily' && 'Shiny, enlarged pores'}
                      {type === 'Dry' && 'Flaky, tight feeling'}
                      {type === 'Combination' && 'Oily T-zone, dry cheeks'}
                      {type === 'Sensitive' && 'Easily irritated, reactive'}
                      {type === 'Normal' && 'Balanced, not too oily or dry'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
           )}

           {step === 2 && (
             <div className="sq-step-container">
               <h2 className="sq-step-title">What are your primary concerns?</h2>
               <p className="sq-step-subtitle">Select all that apply to help us target your routine.</p>
    
               <div className="sq-grid">
                {[
                  { value: 'No Concerns', desc: 'My skin is balanced and healthy' },
                  { value: 'Acne', desc: 'Breakouts and blemishes' },
                  { value: 'Dark Spots', desc: 'Hyperpigmentation' },
                  { value: 'Dryness', desc: 'Dehydrated skin' },
                  { value: 'Fine Lines', desc: 'Signs of aging' }
                ].map(concern => (
                  <button
                    key={concern.value}
                    className={`sq-card ${quizData.concerns.includes(concern.value) ? 'sq-card-active' : ''}`}
                    onClick={() => handleConcernToggle(concern.value)}
                  >
                    <h3 className="sq-card-title">{concern.value}</h3>
                    <p className="sq-card-desc">{concern.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="sq-step-container">
              <h2 className="sq-step-title">What is your preferred budget?</h2>
              <p className="sq-step-subtitle">Per individual product, to ensure tailored recommendations.</p>
              
              <div className="sq-grid">
                {[
                  { value: 'Under 100', label: 'Under RS 100', desc: 'Accessible essentials' },
                  { value: '100-150', label: 'RS 100-150', desc: 'Mid-range effective care' },
                  { value: '150-200', label: 'RS 150-200', desc: 'Premium formulations' },
                  { value: 'Above 200', label: 'Above RS 200', desc: 'Luxury treatments' }
                ].map(budget => (
                  <button
                    key={budget.value}
                    className={`sq-card ${quizData.budgetRange === budget.value ? 'sq-card-active' : ''}`}
                    onClick={() => handleBudgetSelect(budget.value)}
                  >
                    <h3 className="sq-card-title">{budget.label}</h3>
                    <p className="sq-card-desc">{budget.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="sq-step-container">
              <h2 className="sq-step-title">Any formula preferences?</h2>
              <p className="sq-step-subtitle">Optional — select any specific requirements you have.</p>
              
              <div className="sq-grid sq-grid-small">
                {[
                  { value: 'Vegan', icon: '🌿', desc: '100% plant-based ingredients' },
                  { value: 'Cruelty-free', icon: '🐇', desc: 'Never tested on animals' }
                ].map(pref => (
                  <button
                    key={pref.value}
                    className={`sq-card sq-card-icon ${quizData.preferences.includes(pref.value) ? 'sq-card-active' : ''}`}
                    onClick={() => handlePreferenceToggle(pref.value)}
                  >
                    <span className="sq-card-emoji">{pref.icon}</span>
                    <h3 className="sq-card-title">{pref.value}</h3>
                    <p className="sq-card-desc">{pref.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div className="sq-navigation">
          {step > 1 ? (
            <button className="sq-btn sq-btn-back" onClick={handleBack}>
              Back
            </button>
          ) : (
            <div></div> /* Empty div to maintain flex space-between */
          )}
          
          {step < 4 ? (
            <button 
              className="sq-btn sq-btn-next"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next Step
            </button>
          ) : (
            <button 
              className="sq-btn sq-btn-submit"
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
            >
              {loading ? (
                <span className="sq-loading-text">Curating...</span>
              ) : (
                'View My Routine'
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default SkinQuiz;