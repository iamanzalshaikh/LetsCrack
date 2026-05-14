/**
 * Original practice content in the style of CELPIP (structure and skills).
 * Not copied from official Paragon materials.
 */

export const SAMPLE_WRITING_TASK1 = {
  subheading: "Write an email to your building manager",
  backgroundParagraph: `Your apartment building will close the community room for two weeks for repairs. You borrow equipment from the room for a volunteer project you run on weekends. You need the room for one weekend before the closure, or an alternative space from management.

Write an email to the building manager in about 150-200 words. You may use the following points, and you should add your own ideas:

- explain who you are and how you use the community room;
- describe the repair schedule you were told about;
- request a clear plan (one weekend before closure, or another space);
- say what you will do to keep the room tidy and follow building rules.`,
  taskInstructionsText: `Write an email to the building manager.

Your email should be 150-200 words. Use a clear subject line and a polite, professional tone.`,
}

export const SAMPLE_WRITING_TASK2 = {
  surveyTopic: "A new quiet-hours policy in your neighbourhood",
  optionA: "Support the policy (stricter quiet hours at night)",
  optionB: "Change the policy (more flexible hours on weekends)",
  questions: [
    {
      questionNumber: 1,
      questionText:
        "How often does noise from neighbours affect your sleep or focus (never / sometimes / often)?",
      questionType: "rating_scale" as const,
      optionsText: "never, sometimes, often",
      wordCountTarget: "",
    },
    {
      questionNumber: 2,
      questionText:
        "What is one change you would suggest to make the policy fair for families and shift workers?",
      questionType: "open_ended" as const,
      optionsText: "",
      wordCountTarget: "40-60",
    },
  ],
}

/** Order matches SPEAKING_SLOTS: T1, T2, T3, T4, 5A, 5B, T6, T7, T8 */
export const SAMPLE_SPEAKING_PROMPTS: string[] = [
  `Your 18-year-old friend, Linda, is graduating and wants to buy a gift for her school teacher.

Give Linda advice about what she should and should not buy.

Include:
- one or two gift ideas that are appropriate;
- one gift choice she should avoid;
- a short reason for each suggestion.`,
  `Talk about a personal experience. You will have about 30 seconds to prepare and about 60 seconds to speak.

Describe a time you had to finish an important task under a tight deadline. Say:
- what the task was;
- what made it difficult;
- what you did to complete it;
- what you would do differently next time (if anything).`,
  `You will see a scene. Describe it and predict what might happen next. Prepare for about 30 seconds, then speak for about 60 seconds.

Look at the picture and talk about:
- what is happening now;
- one problem or opportunity you notice;
- what you think could happen next (a likely next step).`,
  `Look at the picture and make a prediction.

What do you think will most probably happen next?

Include:
- what is happening right now;
- what clues in the scene support your prediction;
- what likely outcome you expect in the next few minutes.`,
  `Task 5 - Part A (comparing). You work for a clothing company. Your team must choose one promotion method for a new product line.

Option A: Run magazine ads in two popular lifestyle magazines.
Option B: Produce a short promotional video for social media.

Compare both options and decide which one you will choose. Be ready to explain your choice in Part B.`,
  `Task 5 - Part B (persuading). Persuade your co-worker that your choice from Part A is better.

Give at least two clear reasons and one practical example.`,
  `You must handle a difficult situation. Choose ONE option, then explain your plan. Prepare for about 60 seconds, then speak for about 60 seconds.

You borrowed a textbook from your professor. Your family member accidentally damaged it, and the professor needs it back soon for another student.

Choose ONE:
EITHER talk to your professor: explain what happened and offer a practical solution;
OR talk to your family member: explain why they must help replace or repair the book quickly.`,
  `Answer the following question.

Do you think college students should be required to play sports? Explain your reasons.

Include:
- your clear opinion (yes or no);
- two reasons that support your view;
- one example or personal connection.`,
  `You are at a tourist site and you see a group of street performers.

Call your friend and describe in detail what is happening.

Include:
- what the performers are doing;
- what the crowd is doing;
- why the event feels unusual or interesting.`,
]

type SpeakingPreset = {
  prepTime: number
  speakingTime: number
  mediaType?: "none" | "audio" | "video" | "image"
}

/** Order matches SPEAKING_SLOTS: T1, T2, T3, T4, 5A, 5B, T6, T7, T8 */
export const SAMPLE_SPEAKING_PRESETS: SpeakingPreset[] = [
  { prepTime: 30, speakingTime: 90 },
  { prepTime: 30, speakingTime: 60 },
  { prepTime: 30, speakingTime: 60 },
  { prepTime: 30, speakingTime: 60 },
  { prepTime: 60, speakingTime: 0, mediaType: "none" },
  { prepTime: 0, speakingTime: 60, mediaType: "none" },
  { prepTime: 60, speakingTime: 60 },
  { prepTime: 30, speakingTime: 90 },
  { prepTime: 30, speakingTime: 60 },
]
