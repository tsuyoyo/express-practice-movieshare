package mcshare.simple.tasks;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;

import mcshare.simple.host.HostGetter;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

abstract public class TaskBase<P, I, R> extends AsyncTask<P, I, R> {

	abstract protected HttpRequestBase makeRequest(P... params);

	abstract protected R parseResponse(HttpResponse response);

	public interface Listener<R> {

		void onComplete(R res);

	}

	private Listener<R> mListener;

	protected Context mContext;

	protected TaskBase(Listener<R> listener, Context context) {
		mListener = listener;
		mContext = context;
	}

	@Override
	protected R doInBackground(P... params) {

		HttpClient httpClient = new DefaultHttpClient();

		try {
			HttpRequestBase request = makeRequest(params);

			if (null == request) {
				return null;
			}
			HttpResponse response = httpClient.execute(request);

			if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode()) {
				return parseResponse(response);
			} else {
				try {
					JSONObject root = new JSONObject(
							getJSON(response.getEntity()));
					String errMsg = (String) root.get("errMsg");
					Log.e("TaskBase", "Http request failed : "
							+ response.getStatusLine().getStatusCode() + " "
							+ errMsg);
				} catch (JSONException e) {
					Log.w("TaskBase", "Error happens during parsing JSON : "
							+ e.getMessage());
				}

			}

		} catch (IOException e) {
			Log.e("TaskBase", "IOException is thrown : " + e.getMessage());
		}

		return null;
	}

	@Override
	protected void onPostExecute(R result) {
		super.onPostExecute(result);

		mListener.onComplete(result);
	}

	protected String getHost() {
		return HostGetter.get(mContext);
	}

	protected String getJSON(HttpEntity resEntitiy) {
		try {
			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			resEntitiy.writeTo(outputStream);

			return outputStream.toString();
		} catch (IOException e) {

			Log.w("JsonHandleUtil", "Failed to get JSON : " + e.getMessage());
			return null;
		}
	}
	
	protected void addTextBodyWithCharset(MultipartEntityBuilder builder, String key, String value) {
		builder.addTextBody(key, value, ContentType.TEXT_PLAIN.withCharset(Charset.forName("UTF-8")));
	}
}
