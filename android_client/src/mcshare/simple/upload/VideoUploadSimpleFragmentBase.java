/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.upload;

import java.util.List;

import mcshare.simple.MainActivity;
import mcshare.simple.common.CommonConsts;
import mcshare.simple.common.FragmentBase;
import mcshare.simple.rating.RatingDialog;
import mcshare.simple.tasks.rating.Rating;
import mcshare.simple.tasks.rating.RatingGetterTask;
import mcshare.simple.tasks.rating.RatingGetterTask.IRatingGetterListener;
import mcshare.simple.tasks.video.VideoUploadTask;
import mcshare.simple.tasks.video.VideoUploadTask.IVideoUploadTaskListener;
import mcshare.test.R;

import org.json.JSONObject;

import android.app.AlertDialog;
import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.media.ThumbnailUtils;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

public class VideoUploadSimpleFragmentBase extends FragmentBase {

	public static final String KEY_PARAM_CONTENT_ID = "key_param_content_id";

	private String mUserId;

	private String mVideoPath;
	private String mVideoContentId;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		mUserId = getActivity().getIntent().getExtras()
				.getString(MainActivity.EXTRA_USER_ID);
	}
	
	public static VideoUploadSimpleFragmentBase getInstance(String videoUri, Context context) {
		VideoUploadSimpleFragmentBase fragment = new VideoUploadSimpleFragmentBase();
		setupInstance(fragment, videoUri, context);
		return fragment;
	}

	protected static void setupInstance(VideoUploadSimpleFragmentBase fragment,
			String videoUri, Context context) {
		fragment.mVideoContentId = Uri.parse(videoUri).getLastPathSegment();
		fragment.mVideoPath = getFilePath(videoUri, context);
	}

	protected static String getFilePath(String uri, Context context) {
		Cursor c = context.getContentResolver().query(Uri.parse(uri), null,
				null, null, null);
		c.moveToNext();

		int idIndex = c.getColumnIndex(MediaStore.Video.Media.DATA);
		return c.getString(idIndex);
	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		View rootView = inflater.inflate(R.layout.video_upload_simple_fragment,
				container, false);

		// Thumbnail
		setupThumbnail(rootView);

		// Upload button
		setupSubmitButton(rootView);

		return rootView;
	}

	private void setupThumbnail(View root) {
		ImageView imageView = (ImageView) root
				.findViewById(R.id.video_upload_thumbnail);

		// Thumbnail
		Bitmap thumbnail = ThumbnailUtils.createVideoThumbnail(mVideoPath,
				MediaStore.Images.Thumbnails.FULL_SCREEN_KIND);
		imageView.setImageBitmap(thumbnail);
	}

	private void setupSubmitButton(final View root) {
		Button btn = (Button) root.findViewById(R.id.video_upload_btn_upload);
		btn.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {

				RatingDialog.IListener listener = new RatingDialog.IListener() {

					@Override
					public void onComplete(JSONObject rating) {
						if (rating != null) {
							Log.v("MCShareJSON", rating.toString());
						} else {
							Log.v("MCShareJSON", "rating is null...");
						}

						IVideoUploadTaskListener uploadListener = new IVideoUploadTaskListener() {
							@Override
							public void onComplete(Integer result) {

								dismissWaitDialog();

								switch (result) {
								case VideoUploadTask.Error.BAD_URL:
									showErrorDialog("Failed to upload due to Bad URL");
									break;
								case VideoUploadTask.Error.FAILED_TO_UPLOAD:
									showErrorDialog("Failed to upload");
									break;
								case VideoUploadTask.Error.UNSUPPORTED_VIDEO:
									showErrorDialog("Failed to upload due to unsupported video");
									break;
								default:
									break;
								}

								// finish when the upload is completed
								Toast.makeText(getActivity(),
										"Thanks for your cooperation!!",
										Toast.LENGTH_SHORT).show();
								getActivity().finish();
							}
						};

						VideoUploadTask task = new VideoUploadTask(
								getActivity(), uploadListener);
						VideoUploadTask.Params params = createUploadParams(
								root, rating);

						if (null != params) {
							showWaitDialog();
							task.execute(params);
						}
					}
				};

				if (getEnteredTitle(getView()).isEmpty()) {
					AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
					builder.setTitle(getResources().getText(R.string.alert_no_title_title));
					builder.setMessage(getResources().getText(R.string.alert_no_title_message));
					builder.setPositiveButton(getResources().getText(R.string.ok), null);
					builder.create().show();
				} else {
					showRatingDialog(listener);					
				}


			}
		});
	}

	private void showRatingDialog(final RatingDialog.IListener dialogListener) {

		IRatingGetterListener taskListener = new IRatingGetterListener() {

			@Override
			public void onComplete(List<Rating> res) {

				Log.d("MCShare", "response size : " + res.size());
				RatingDialog ratingDialog = RatingDialog.getInstance(
						getActivity(), dialogListener, res);
				ratingDialog.show();
			}
		};

		RatingGetterTask task = new RatingGetterTask(taskListener,
				getActivity());
		task.execute();

	}
	
	private VideoUploadTask.Params createUploadParams(View rootView,
			JSONObject rating) {

		String title = getEnteredTitle(rootView);

		return new VideoUploadTask.Params(mVideoContentId, title, mUserId,
				null, CommonConsts.SPECIFIC_CATEGORY, rating);
	}

	private String getEnteredTitle(View rootView) {
		EditText titleForm = (EditText) rootView
				.findViewById(R.id.video_upload_title_form);
		return titleForm.getText().toString();
	}

}
