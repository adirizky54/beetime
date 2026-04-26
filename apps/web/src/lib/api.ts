import ky, { type KyInstance, type Options } from "ky";

interface ApiClientConfig {
	baseUrl: string
	prefix?: string
	headers?: Record<string, string>
	timeout?: number
	hooks?: Options["hooks"]
}

export interface ResponseApi<T> {
	message: string
	data: T | null
	meta?: {
		page: number
		pageCount: number
		pageSize: number
		total: number
	}
};

export interface ResponseApiError {
	error: boolean;
	errors?: Record<string, Array<string>>;
	message: string;
};

class ApiClient {
	private client: KyInstance;

	constructor(config: ApiClientConfig) {
		this.client = ky.create({
			baseUrl: config.baseUrl,
			prefix: config.prefix,
			timeout: config.timeout || 30000,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...config.headers,
			},
			hooks: config.hooks,
		});
	}

	async get<T>(path: string, options?: Options): Promise<ResponseApi<T>> {
		const response = await this.client.get(path, options);
		return response.json<ResponseApi<T>>();
	}

	async post<T>(path: string, data?: unknown, options?: Options): Promise<ResponseApi<T>> {
		const response = await this.client.post(path, {
			json: data,
			...options,
		});
		return response.json<ResponseApi<T>>();
	}

	async postForm<T>(
		path: string,
		data: Record<string, string>,
		options?: Options,
	): Promise<ResponseApi<T>> {
		const formData = new URLSearchParams(data);
		const response = await this.client.post(path, {
			body: formData,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			...options,
		});
		return response.json<ResponseApi<T>>();
	}

	async put<T>(path: string, data?: unknown, options?: Options): Promise<ResponseApi<T>> {
		const response = await this.client.put(path, {
			json: data,
			...options,
		});
		return response.json<ResponseApi<T>>();
	}

	async patch<T>(path: string, data?: unknown, options?: Options): Promise<ResponseApi<T>> {
		const response = await this.client.patch(path, {
			json: data,
			...options,
		});
		return response.json<ResponseApi<T>>();
	}

	async delete<T>(path: string, options?: Options): Promise<ResponseApi<T>> {
		const response = await this.client.delete(path, options);
		return response.json<ResponseApi<T>>();
	}
}

export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
	prefix: "/api"
});
