export const getToastContent = (errorType: 'timeout' | 'network' | 'api_error' | 'service_outage'): { title: string; message: string } => {
  switch (errorType) {
    case 'service_outage':
      return {
        title: 'NASA API Service Outage',
        message: 'Showing demo content. NASA APOD service is currently unavailable.'
      };
    case 'timeout':
      return {
        title: 'Request Timed Out',
        message: 'Showing demo content. NASA APOD service is currently unavailable.'
      };
    case 'network':
      return {
        title: 'Network Error',
        message: 'Network error. Please check your internet connection.'
      };
    case 'api_error':
    default:
      return {
        title: 'Demo Mode',
        message: 'Showing demo content. NASA APOD service is currently unavailable.'
      };
  }
};

