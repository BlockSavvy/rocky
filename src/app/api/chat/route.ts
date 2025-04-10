import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Simple response logic based on keywords
    let response = '';
    const lowerCaseMessage = message.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      response = "Hello! I'm your rehabilitation assistant. How can I help you today?";
    } else if (lowerCaseMessage.includes('pain')) {
      response = "I'm sorry to hear you're experiencing pain. Remember to log your pain levels in the progress logger. If your pain is severe, please contact your healthcare provider.";
    } else if (lowerCaseMessage.includes('exercise')) {
      response = "Regular exercise is important for your recovery. Make sure to follow your rehabilitation plan and don't push yourself too hard. Log your progress to track improvements over time.";
    } else if (lowerCaseMessage.includes('progress')) {
      response = "Your progress is being tracked in the Progress section. The Analytics tab shows visualizations of your improvement. It's common to have ups and downs during rehabilitation, but consistent effort leads to positive outcomes.";
    } else if (lowerCaseMessage.includes('help')) {
      response = "I can help answer questions about your rehabilitation, exercises, or how to use this app. You can also check the Resources tab for helpful articles and videos.";
    } else {
      response = "Thank you for your message. I'm a basic assistant for this demo. In a fully-implemented version, I would have more advanced capabilities to assist with your rehabilitation journey.";
    }
    
    // Add a slight delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      sender: 'ai', 
      text: response 
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 