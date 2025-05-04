
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
