/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.upload;

import java.util.List;

import mcshare.simple.MainActivity;
import mcshare.simple.common.FragmentBase;
import mcshare.simple.rating.RatingDialog;
import mcshare.simple.tasks.category.VideoCategory;
import mcshare.simple.tasks.category.VideoCategoryGetterTask;
import mcshare.simple.tasks.category.VideoCategoryGetterTask.ICategoryGetterListener;
import mcshare.simple.tasks.category.VideoCategorySubmitTask;
import mcshare.simple.tasks.rating.Rating;
import mcshare.simple.tasks.rating.RatingGetterTask;
import mcshare.simple.tasks.rating.RatingGetterTask.IRatingGetterListener;
import mcshare.simple.tasks.tag.VideoTag;
import mcshare.simple.tasks.tag.VideoTagSubmitTask;
import mcshare.simple.tasks.tag.VideoTagsGetTask;
import mcshare.simple.tasks.tag.VideoTagsGetTask.IVideoTagsGetterListener;
import mcshare.simple.tasks.video.VideoUploadTask;
import mcshare.simple.tasks.video.VideoUploadTask.IVideoUploadTaskListener;
import mcshare.test.R;

import org.json.JSONObject;

import android.app.ProgressDialog;
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
import android.widget.Spinner;
import android.widget.Toast;

public class VideoUploadFragment extends FragmentBase {

	public static final String KEY_PARAM_CONTENT_ID = "key_param_content_id";

	private String mUserId;
	private String mUserName;

	private Spinner mCategorySpinner;
	private Spinner mVideoTagSpinner;
	private String mVideoPath;
	private String mVideoContentId;

	public static VideoUploadFragment getInstance(String videoUri,
			Context context) {
		VideoUploadFragment fragment = new VideoUploadFragment();
		fragment.mVideoContentId = Uri.parse(videoUri).getLastPathSegment();
		fragment.mVideoPath = getFilePath(videoUri, context);
		return fragment;
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		mUserId = getActivity().getIntent().getExtras()
				.getString(MainActivity.EXTRA_USER_ID);
		mUserName = getActivity().getIntent().getExtras()
				.getString(MainActivity.EXTRA_USER_NAME);
	}

	private static String getFilePath(String uri, Context context) {
		Cursor c = context.getContentResolver().query(Uri.parse(uri), null,
				null, null, null);
		c.moveToNext();

		int idIndex = c.getColumnIndex(MediaStore.Video.Media.DATA);
		return c.getString(idIndex);
	}

	public VideoUploadFragment() {
		super();
	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		View rootView = inflater.inflate(R.layout.video_upload_fragment,
				container, false);

		// Thumbnail
		setupThumbnail(rootView);

		// Category
		setupCategoryList(rootView);

		// Add Category
		setupAddCategoryButton(rootView);

		// Tag
		setupTagsList(rootView);

		// Add tag
		setupAddTagButton(rootView);

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

	private void setupCategoryList(View root) {
		VideoCategorySpinnerAdapter adapter = new VideoCategorySpinnerAdapter(
				getActivity());
		mCategorySpinner = (Spinner) root
				.findViewById(R.id.video_upload_category_list);
		mCategorySpinner.setAdapter(adapter);

		updateCategoryList();
	}

	private void updateCategoryList() {
		ICategoryGetterListener categoryGetterLister = new ICategoryGetterListener() {
			@Override
			public void onComplete(List<VideoCategory> categories) {
				VideoCategorySpinnerAdapter adapter = (VideoCategorySpinnerAdapter) mCategorySpinner
						.getAdapter();
				adapter.setCategories(categories);
				adapter.notifyDataSetChanged();
			}
		};
		VideoCategoryGetterTask categoryGetter = new VideoCategoryGetterTask(
				categoryGetterLister, getActivity());

		categoryGetter.execute();
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

				showRatingDialog(listener);

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

		String categoryId = getSelectedCategoryId(rootView);

		String tagId = getSelectedTagId(rootView);

		if (title.length() == 0 || mUserId.length() == 0
				|| categoryId.length() == 0) {
			return null;
		}

		return new VideoUploadTask.Params(mVideoContentId, title, mUserId,
				tagId, categoryId, rating);
	}

	private String getEnteredTitle(View rootView) {
		EditText titleForm = (EditText) rootView
				.findViewById(R.id.video_upload_title_form);
		return titleForm.getText().toString();
	}

	private String getSelectedCategoryId(View rootView) {
		Spinner spinner = (Spinner) rootView
				.findViewById(R.id.video_upload_category_list);
		VideoCategory category = (VideoCategory) spinner.getSelectedItem();
		return category.id;
	}

	private void setupTagsList(View root) {
		VideoTagAdapter adapter = new VideoTagAdapter(getActivity());
		mVideoTagSpinner = (Spinner) root
				.findViewById(R.id.video_upload_tag_list);
		mVideoTagSpinner.setAdapter(adapter);
		updateTagsList();
	}

	private void updateTagsList() {
		IVideoTagsGetterListener tagsGetterLister = new IVideoTagsGetterListener() {
			@Override
			public void onComplete(List<VideoTag> tags) {
				VideoTagAdapter adapter = (VideoTagAdapter) mVideoTagSpinner
						.getAdapter();
				adapter.setData(tags);
				adapter.notifyDataSetChanged();
			}
		};
		VideoTagsGetTask getter = new VideoTagsGetTask(tagsGetterLister,
				getActivity());
		getter.execute();
	}

	private void setupAddCategoryButton(final View root) {
		Button btn = (Button) root
				.findViewById(R.id.video_upload_category_add_btn);
		btn.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				VideoCategoryRegisterDialog.IListener listener = new VideoCategoryRegisterDialog.IListener() {

					@Override
					public void onAddClicked(String categoryName,
							boolean isPublic) {

						final ProgressDialog waitDialog = new ProgressDialog(
								getActivity(), ProgressDialog.STYLE_SPINNER);
						waitDialog.setMessage("Adding new category");
						VideoCategorySubmitTask.ICategorySubmitListener listener = new VideoCategorySubmitTask.ICategorySubmitListener() {

							@Override
							public void onComplete(Integer res) {
								waitDialog.dismiss();
								updateCategoryList();
							}
						};

						VideoCategorySubmitTask task = new VideoCategorySubmitTask(
								categoryName, isPublic, listener, getActivity());
						waitDialog.show();
						task.execute();
					}
				};

				VideoCategoryRegisterDialog dialog = VideoCategoryRegisterDialog
						.getInstance(getActivity(), listener);
				dialog.show();
			}
		});
	}

	private void setupAddTagButton(final View root) {
		Button btn = (Button) root.findViewById(R.id.video_upload_tag_add_btn);
		btn.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				VideoTagRegisterDialog.IListener listener = new VideoTagRegisterDialog.IListener() {

					@Override
					public void onAddClicked(String tagName) {

						final ProgressDialog waitDialog = new ProgressDialog(
								getActivity(), ProgressDialog.STYLE_SPINNER);
						waitDialog.setMessage("Adding new category");
						VideoTagSubmitTask.ITagSubmitListener listener = new VideoTagSubmitTask.ITagSubmitListener() {

							@Override
							public void onComplete(Integer res) {
								waitDialog.dismiss();
								updateTagsList();
							}
						};

						VideoTagSubmitTask task = new VideoTagSubmitTask(
								tagName, listener, getActivity());
						waitDialog.show();
						task.execute();
					}
				};

				VideoTagRegisterDialog dialog = VideoTagRegisterDialog
						.getInstance(getActivity(), listener);
				dialog.show();
			}
		});
	}

	private String getSelectedTagId(View rootView) {
		Spinner spinner = (Spinner) rootView
				.findViewById(R.id.video_upload_tag_list);
		VideoTag tag = (VideoTag) spinner.getSelectedItem();
		if (null != tag) {
			return tag.id;
		} else {
			return null;
		}
	}
}
