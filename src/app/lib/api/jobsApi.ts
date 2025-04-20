export interface Job {
  id: string;
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: string;
}

export interface JobsResponse {
  data: Job[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export const fetchJobs = async (keywords?: string[]): Promise<JobsResponse> => {
  try {
    let url = 'https://www.arbeitnow.com/api/job-board-api';
    
    // If keywords are provided, add them as query parameters
    if (keywords && keywords.length > 0) {
      url += `?keywords=${keywords.join(',')}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching jobs: ${response.statusText}`);
    }
    
    return await response.json() as JobsResponse;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}; 