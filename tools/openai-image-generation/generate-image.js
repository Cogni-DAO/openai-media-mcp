/**
 * Function to generate an image using OpenAI's DALL-E API.
 *
 * @param {Object} args - Arguments for the image generation.
 * @param {string} args.prompt - The text description of the desired image.
 * @param {string} [args.model="dall-e-3"] - The model to use for image generation.
 * @param {number} [args.n=1] - Number of images to generate (1-10 for DALL-E 2, 1 for DALL-E 3).
 * @param {string} [args.quality="standard"] - The quality of the image (DALL-E 3 only).
 * @param {string} [args.response_format="url"] - The format of the response ("url" or "b64_json").
 * @param {string} [args.size="1024x1024"] - The size of the generated image.
 * @param {string} [args.style="vivid"] - The style of the image (DALL-E 3 only).
 * @param {string} [args.user] - A unique identifier representing your end-user.
 * @returns {Promise<Object>} - The result of the image generation.
 */
const executeFunction = async ({ 
  prompt, 
  model = 'dall-e-3', 
  n = 1, 
  quality = 'standard', 
  response_format = 'url', 
  size = '1024x1024', 
  style = 'vivid', 
  user 
}) => {
  const baseUrl = 'https://api.openai.com';
  const token = process.env.API_KEY;

  if (!token) {
    return { error: 'API_KEY environment variable is not set.' };
  }

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/v1/images/generations`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Prepare the request body
    const body = {
      prompt,
      model,
      n,
      quality,
      response_format,
      size,
      style
    };

    // Add user if provided
    if (user) {
      body.user = user;
    }

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    // Check if the response was successful
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        // Response wasn't JSON, use the HTTP status message
      }
      throw new Error(errorMessage);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating image:', error);
    return { error: error.message || 'An error occurred while generating the image.' };
  }
};

/**
 * Tool configuration for generating images using OpenAI's DALL-E API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'GenerateImage',
      description: 'Generate an image using OpenAI\'s DALL-E API.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The text description of the desired image (max 1000 chars for DALL-E 2, 4000 for DALL-E 3).'
          },
          model: {
            type: 'string',
            description: 'The model to use for image generation.',
            enum: ['dall-e-2', 'dall-e-3'],
            default: 'dall-e-3'
          },
          n: {
            type: 'integer',
            description: 'Number of images to generate (1-10 for DALL-E 2, 1 for DALL-E 3).',
            minimum: 1,
            maximum: 10,
            default: 1
          },
          quality: {
            type: 'string',
            description: 'The quality of the image (DALL-E 3 only).',
            enum: ['standard', 'hd'],
            default: 'standard'
          },
          response_format: {
            type: 'string',
            description: 'The format of the response.',
            enum: ['url', 'b64_json'],
            default: 'url'
          },
          size: {
            type: 'string',
            description: 'The size of the generated image.',
            enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
            default: '1024x1024'
          },
          style: {
            type: 'string',
            description: 'The style of the image (DALL-E 3 only).',
            enum: ['vivid', 'natural'],
            default: 'vivid'
          },
          user: {
            type: 'string',
            description: 'A unique identifier representing your end-user.'
          }
        },
        required: ['prompt']
      }
    }
  }
};

export { apiTool };