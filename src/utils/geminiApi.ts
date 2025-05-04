
// This would be connected to a real API in a production environment
// For now, we'll simulate responses

interface GeminiResponse {
  text: string;
}

export async function generateGeminiResponse(prompt: string): Promise<string> {
  console.log("Generating response for:", prompt);
  
  // In a real implementation, this would call the Gemini API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate response generation
      const optometryResponse = generateOptometryResponse(prompt);
      resolve(optometryResponse);
    }, 1500);
  });
}

export async function generateFollowUpQuestions(question: string, answer: string): Promise<string[]> {
  console.log("Generating follow-up questions for:", question);
  
  // In a real implementation, this would call the Gemini API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate relevant follow-up questions based on the topic
      const followupQuestions = generateOptometryFollowUps(question);
      resolve(followupQuestions);
    }, 1000);
  });
}

export async function generateQuizWithAnswers(topic: string, questionCount: number, difficulty: string): Promise<any[]> {
  console.log(`Generating ${questionCount} ${difficulty} questions about ${topic}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate quiz questions with answers
      const quizQuestions = generateQuizQuestions(topic, questionCount, difficulty);
      resolve(quizQuestions);
    }, 2000);
  });
}

// Helper function to generate optometry-specific responses
function generateOptometryResponse(prompt: string): string {
  // Extract main topic from prompt
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("glaucoma")) {
    return `## Glaucoma

Glaucoma is a group of eye conditions that damage the optic nerve, often due to abnormally high pressure within the eye (intraocular pressure or IOP).

### Types of Glaucoma
- **Open-angle glaucoma**: Most common form, gradual loss of peripheral vision
- **Angle-closure glaucoma**: Can present acutely with pain and rapid vision loss
- **Normal-tension glaucoma**: Optic nerve damage despite normal IOP
- **Secondary glaucoma**: Resulting from other eye conditions

### Diagnostic Tests
- Tonometry to measure IOP
- Gonioscopy to examine the drainage angle
- Visual field testing to assess peripheral vision
- OCT to examine the optic nerve head and RNFL

### Treatment Options
1. **Medications**: Eye drops to lower IOP (prostaglandin analogs, beta blockers)
2. **Laser therapy**: Trabeculoplasty, iridotomy
3. **Surgery**: Trabeculectomy, tube shunt implantation

Early detection and treatment are critical to prevent vision loss.`;
  } 
  else if (lowerPrompt.includes("cataract")) {
    return `## Cataracts

A cataract is a clouding of the eye's natural lens that affects vision. Cataracts are the leading cause of blindness worldwide.

### Types of Cataracts
- **Nuclear cataracts**: Affecting the center of the lens
- **Cortical cataracts**: Affecting the edges of the lens
- **Posterior subcapsular cataracts**: Affecting the back of the lens
- **Congenital cataracts**: Present at birth or developing in childhood

### Diagnosis
- Visual acuity testing
- Slit lamp examination
- Retinal examination through dilated pupils

### Treatment
- Early-stage: Prescription glasses, anti-glare sunglasses
- Advanced: Surgical removal of the clouded lens and replacement with an artificial intraocular lens (IOL)

### Types of IOLs
- Monofocal
- Multifocal
- Toric (for astigmatism)
- Accommodating

Cataract surgery is one of the most common and successful surgical procedures performed today.`;
  }
  else if (lowerPrompt.includes("myopia") || lowerPrompt.includes("nearsighted")) {
    return `## Myopia (Nearsightedness)

Myopia is a refractive error where close objects appear clear, but distant objects appear blurry.

### Causes
- Elongated eyeball
- Too much corneal curvature
- Genetic factors
- Environmental factors (increased near work, reduced outdoor time)

### Classification
- **Low myopia**: -0.50D to -3.00D
- **Moderate myopia**: -3.25D to -6.00D
- **High myopia**: Greater than -6.00D

### Diagnosis
- Visual acuity testing
- Refraction assessment
- Biometry (axial length measurement)

### Management Options
1. **Optical correction**: Glasses, contact lenses
2. **Myopia control**:
   - Orthokeratology
   - Atropine eye drops
   - Multifocal contact lenses
   - Increased outdoor time for children
3. **Refractive surgery**:
   - LASIK
   - PRK
   - SMILE

Myopia is increasingly prevalent worldwide, with high myopia carrying increased risks of retinal detachment, glaucoma, and myopic maculopathy.`;
  } 
  else {
    return `## Optometry Concepts

The field of optometry encompasses the diagnosis, management, and treatment of disorders related to the visual system. Here are some key aspects:

### Primary Eye Care
- Comprehensive eye examinations
- Visual acuity testing
- Binocular vision assessment
- Management of ocular diseases

### Common Visual Conditions
- Refractive errors (myopia, hyperopia, astigmatism, presbyopia)
- Binocular vision disorders
- Ocular surface disease
- Age-related eye conditions

### Diagnostic Techniques
- Slit lamp biomicroscopy
- Ophthalmoscopy
- Tonometry
- Automated visual field testing
- Optical coherence tomography (OCT)

### Clinical Management
- Optical corrections (spectacles, contact lenses)
- Vision therapy
- Low vision rehabilitation
- Co-management of ocular surgery
- Pharmaceutical interventions

Evidence-based practice is essential in modern optometric care, combining clinical expertise with the best available research evidence and patient values.`;
  }
}

function generateOptometryFollowUps(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes("glaucoma")) {
    return [
      "What causes elevated IOP?",
      "How do OCT scans help in glaucoma diagnosis?",
      "When is trabeculectomy indicated?",
      "Difference between open and closed-angle glaucoma"
    ];
  } 
  else if (lowerQuestion.includes("cataract")) {
    return [
      "When should cataracts be surgically removed?",
      "Benefits of multifocal IOLs?",
      "Post-operative cataract care",
      "Complications of cataract surgery"
    ];
  }
  else if (lowerQuestion.includes("myopia") || lowerQuestion.includes("nearsighted")) {
    return [
      "How effective is atropine for myopia control?",
      "Risks of high myopia",
      "Best age for myopia intervention",
      "Orthokeratology vs. multifocal contacts"
    ];
  }
  else if (lowerQuestion.includes("contact lens")) {
    return [
      "Soft vs. RGP lenses",
      "Managing contact lens discomfort",
      "Extended wear risks",
      "Specialty lens options"
    ];
  }
  else {
    return [
      "Common refractive errors?",
      "Clinical tests for binocular vision",
      "Managing dry eye syndrome",
      "Latest advancements in optometry"
    ];
  }
}

function generateQuizQuestions(topic: string, count: number, difficulty: string): any[] {
  const questions = [];
  const topics = {
    glaucoma: [
      {
        question: "What is the most common type of glaucoma?",
        options: [
          "Open-angle glaucoma",
          "Angle-closure glaucoma",
          "Secondary glaucoma",
          "Normal-tension glaucoma"
        ],
        correctAnswer: 0,
        explanation: "Open-angle glaucoma is the most common form, accounting for about 90% of all glaucoma cases. It develops slowly and often without noticeable symptoms."
      },
      {
        question: "Which of the following is NOT typically used to diagnose glaucoma?",
        options: [
          "Tonometry",
          "Ophthalmoscopy",
          "Electroretinography (ERG)",
          "Perimetry"
        ],
        correctAnswer: 2,
        explanation: "Electroretinography (ERG) measures the electrical response of the retina to light stimulation and is not routinely used for glaucoma diagnosis. Tonometry, ophthalmoscopy, and perimetry are standard diagnostic tests."
      },
      {
        question: "What is the primary risk factor for developing primary open-angle glaucoma?",
        options: [
          "Elevated intraocular pressure",
          "Family history",
          "Age over 60",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All of these factors increase the risk of developing primary open-angle glaucoma, with elevated IOP being the most significant modifiable risk factor."
      },
      {
        question: "Which medication class is typically considered first-line treatment for open-angle glaucoma?",
        options: [
          "Beta blockers",
          "Prostaglandin analogs",
          "Alpha agonists",
          "Carbonic anhydrase inhibitors"
        ],
        correctAnswer: 1,
        explanation: "Prostaglandin analogs are typically considered first-line treatment due to their once-daily dosing, effective IOP reduction, and relatively mild side effect profile."
      },
      {
        question: "In angle-closure glaucoma, what anatomical feature is primarily responsible for the blockage?",
        options: [
          "Swollen lens",
          "Iris",
          "Trabecular meshwork",
          "Ciliary body"
        ],
        correctAnswer: 1,
        explanation: "In angle-closure glaucoma, the peripheral iris blocks the trabecular meshwork, preventing aqueous humor from draining properly."
      }
    ],
    "diabetic retinopathy": [
      {
        question: "What is the earliest clinically detectable sign of diabetic retinopathy?",
        options: [
          "Microaneurysms",
          "Cotton wool spots",
          "Neovascularization",
          "Hard exudates"
        ],
        correctAnswer: 0,
        explanation: "Microaneurysms are the earliest clinically detectable sign of diabetic retinopathy, appearing as small red dots on the retina."
      },
      {
        question: "Which of the following best describes proliferative diabetic retinopathy (PDR)?",
        options: [
          "Presence of microaneurysms only",
          "Formation of new abnormal blood vessels",
          "Macular edema without neovascularization",
          "Hard exudates arranged in a circinate pattern"
        ],
        correctAnswer: 1,
        explanation: "Proliferative diabetic retinopathy is characterized by neovascularization - the growth of new, abnormal blood vessels on the retina and/or optic disc."
      },
      {
        question: "What is the primary risk factor for developing diabetic retinopathy?",
        options: [
          "Duration of diabetes",
          "Poor glycemic control",
          "Hypertension",
          "Both A and B"
        ],
        correctAnswer: 3,
        explanation: "Both duration of diabetes and poor glycemic control are the primary risk factors for developing diabetic retinopathy."
      },
      {
        question: "What treatment is most appropriate for diabetic macular edema (DME)?",
        options: [
          "Observation only",
          "Intravitreal anti-VEGF injections",
          "Panretinal photocoagulation",
          "Vitrectomy"
        ],
        correctAnswer: 1,
        explanation: "Intravitreal anti-VEGF injections are the first-line treatment for diabetic macular edema, as they reduce vascular leakage and macular swelling."
      },
      {
        question: "How often should patients with type 2 diabetes without retinopathy have dilated eye examinations?",
        options: [
          "Every 6 months",
          "Annually",
          "Every 2 years",
          "Only when symptoms develop"
        ],
        correctAnswer: 1,
        explanation: "Patients with type 2 diabetes without retinopathy should have annual dilated eye examinations to monitor for the development of diabetic retinopathy."
      }
    ],
    keratoconus: [
      {
        question: "Which corneal layer is primarily affected in keratoconus?",
        options: [
          "Epithelium",
          "Bowman's layer",
          "Stroma",
          "Endothelium"
        ],
        correctAnswer: 2,
        explanation: "The stroma is primarily affected in keratoconus, with thinning and weakening of this layer leading to the characteristic cone-shaped protrusion."
      },
      {
        question: "What is the most common presenting symptom of keratoconus?",
        options: [
          "Pain",
          "Redness",
          "Progressive vision distortion",
          "Complete vision loss"
        ],
        correctAnswer: 2,
        explanation: "Progressive vision distortion, including blurring and distortion of images, is the most common presenting symptom of keratoconus."
      },
      {
        question: "Which of the following is NOT a risk factor for keratoconus?",
        options: [
          "Eye rubbing",
          "Genetic predisposition",
          "Atopic conditions",
          "Hypertension"
        ],
        correctAnswer: 3,
        explanation: "Hypertension is not a risk factor for keratoconus. Eye rubbing, genetic predisposition, and atopic conditions (like allergies and eczema) are established risk factors."
      },
      {
        question: "What treatment option aims to strengthen the corneal structure in early keratoconus?",
        options: [
          "Corneal transplantation",
          "Corneal crosslinking (CXL)",
          "Intracorneal ring segments",
          "Photorefractive keratectomy (PRK)"
        ],
        correctAnswer: 1,
        explanation: "Corneal crosslinking (CXL) aims to strengthen the corneal structure by creating new chemical bonds in the stroma, stabilizing the progression of keratoconus."
      },
      {
        question: "Which diagnostic test can display the characteristic 'scissor reflex' in keratoconus?",
        options: [
          "OCT",
          "Retinoscopy",
          "Pachymetry",
          "Specular microscopy"
        ],
        correctAnswer: 1,
        explanation: "Retinoscopy can display the characteristic 'scissor reflex' (an irregular light reflex that moves in opposite directions) in patients with keratoconus."
      }
    ],
    "dry eye": [
      {
        question: "Which of the following is NOT a layer of the tear film?",
        options: [
          "Lipid layer",
          "Aqueous layer",
          "Mucin layer",
          "Protein layer"
        ],
        correctAnswer: 3,
        explanation: "The tear film consists of three layers: lipid (outermost), aqueous (middle), and mucin (innermost). There is no distinct protein layer, although proteins are present within the aqueous component."
      },
      {
        question: "Which test evaluates tear film stability in dry eye assessment?",
        options: [
          "Schirmer test",
          "Tear break-up time (TBUT)",
          "Rose Bengal staining",
          "Tear osmolarity"
        ],
        correctAnswer: 1,
        explanation: "Tear break-up time (TBUT) specifically evaluates tear film stability by measuring the time it takes for the tear film to break up after a complete blink."
      },
      {
        question: "Which medication class can contribute to dry eye symptoms?",
        options: [
          "Antihistamines",
          "Beta blockers",
          "Diuretics",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All of these medication classes can contribute to dry eye symptoms through various mechanisms that reduce tear production or alter tear composition."
      },
      {
        question: "Which glands produce the lipid component of the tear film?",
        options: [
          "Lacrimal glands",
          "Meibomian glands",
          "Goblet cells",
          "Accessory lacrimal glands"
        ],
        correctAnswer: 1,
        explanation: "Meibomian glands, located in the tarsal plates of the eyelids, produce the oily (lipid) component of the tear film that helps prevent tear evaporation."
      },
      {
        question: "Which of the following is NOT a typical symptom of dry eye syndrome?",
        options: [
          "Burning sensation",
          "Foreign body sensation",
          "Photophobia",
          "Increased tear production"
        ],
        correctAnswer: 3,
        explanation: "Increased tear production is not typically a symptom of dry eye syndrome. While reflex tearing can occur, the characteristic symptoms include burning, foreign body sensation, and photophobia."
      }
    ]
  };
  
  // Default to general optometry questions if topic not found
  const topicKey = Object.keys(topics).find(key => topic.toLowerCase().includes(key.toLowerCase())) || "glaucoma";
  const availableQuestions = topics[topicKey];
  
  for (let i = 0; i < Math.min(count, availableQuestions.length); i++) {
    questions.push(availableQuestions[i]);
  }
  
  return questions;
}
