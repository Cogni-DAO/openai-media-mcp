/**
 * Function to create variations of an image using OpenAI's DALL-E API.
 *
 * @param {Object} args - Arguments for the image variation.
 * @param {string} args.image - The image to create variations of (base64 encoded PNG).
 * @param {string} [args.model="dall-e-2"] - The model to use for image variations.
 * @param {number} [args.n=1] - Number of images to generate (1-10).
 * @param {string} [args.response_format="url"] - The format of the response ("url" or "b64_json").
 * @param {string} [args.size="1024x1024"] - The size of the generated image.
 * @param {string} [args.user] - A unique identifier representing your end-user.
 * @returns {Promise<Object>} - The result of the image variation.
 */
const executeFunction = async ({ 
  image, 
  model = 'dall-e-2', 
  n = 1, 
  response_format = 'url', 
  size = '1024x1024', 
  user 
}) => {
  const baseUrl = 'https://api.openai.com';
  const token = process.env.API_KEY;

  if (!token) {
    return { error: 'API_KEY environment variable is not set.' };
  }

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/v1/images/variations`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Prepare the form data
    const formData = new FormData();
    
    // Convert base64 image to blob
    const imageBlob = new Blob([Buffer.from(image, 'base64')], { type: 'image/png' });
    formData.append('image', imageBlob, 'image.png');
    
    formData.append('model', model);
    formData.append('n', n.toString());
    formData.append('response_format', response_format);
    formData.append('size', size);

    // Add user if provided
    if (user) {
      formData.append('user', user);
    }

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
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
    console.error('Error creating image variation:', error);
    return { error: error.message || 'An error occurred while creating the image variation.' };
  }
};

/**
 * Tool configuration for creating image variations using OpenAI's DALL-E API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'CreateImageVariation',
      description: 'Create variations of an image using OpenAI\'s DALL-E API.',
      parameters: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            description: 'The image to create variations of (base64 encoded PNG, <4MB, square).'
          },
          model: {
            type: 'string',
            description: 'The model to use for image variations.',
            enum: ['dall-e-2'],
            default: 'dall-e-2'
          },
          n: {
            type: 'integer',
            description: 'Number of images to generate (1-10).',
            minimum: 1,
            maximum: 10,
            default: 1
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
            enum: ['256x256', '512x512', '1024x1024'],
            default: '1024x1024'
          },
          user: {
            type: 'string',
            description: 'A unique identifier representing your end-user.'
          }
        },
        required: ['image']
      }
    }
  }
};

export { apiTool };