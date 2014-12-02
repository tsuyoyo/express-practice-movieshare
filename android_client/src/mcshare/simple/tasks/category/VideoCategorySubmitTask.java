/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.category;

import java.net.URI;
import java.net.URISyntaxException;

import mcshare.simple.tasks.TaskBase;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.mime.MultipartEntityBuilder;

import android.content.Context;

public class VideoCategorySubmitTask extends TaskBase<Void, Void, Integer> {

	public static int RES_OK = 0;

	public static int RES_NG = -1;

	public interface ICategorySubmitListener extends TaskBase.Listener<Integer> {
	}

	private final String mCategoryName;

	private final String mIsPublic;

	public VideoCategorySubmitTask(String categoryName, boolean isPublic,
			ICategorySubmitListener listener, Context context) {
		super(listener, context);
		mCategoryName = categoryName;
		mIsPublic = Boolean.toString(isPublic);
	}

	@Override
	protected HttpRequestBase makeRequest(Void... parmas) {

		MultipartEntityBuilder builder = MultipartEntityBuilder.create();
		
		addTextBodyWithCharset(builder, "name", mCategoryName);

		builder.addTextBody("ispublic", mIsPublic);

		try {
			String api = "http://" + getHost() + "/videocategory/add/";
			HttpPost request = new HttpPost(new URI(api));
			request.setEntity(builder.build());
			return request;

		} catch (URISyntaxException e) {
			return null;
		}
	}

	@Override
	protected Integer parseResponse(HttpResponse response) {
		return RES_OK;
	}

}
