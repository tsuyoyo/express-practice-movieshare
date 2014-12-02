/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.upload;

import mcshare.test.R;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.view.View;
import android.widget.EditText;

public class VideoTagRegisterDialog extends AlertDialog {

	public static VideoTagRegisterDialog getInstance(Context context,
			VideoTagRegisterDialog.IListener listener) {
		return new VideoTagRegisterDialog(context, listener);
	}

	public interface IListener {
		public void onAddClicked(String tagName);
	}

	private IListener mListener;

	protected VideoTagRegisterDialog(Context context,
			VideoTagRegisterDialog.IListener listener) {
		super(context);

		mListener = listener;

		createView();

		setTitle("Add new tag");
		setView(mRootView);
		setOnClickListener();
	}

	private View mRootView;

	private void createView() {
		mRootView = getLayoutInflater().inflate(R.layout.tag_register_dialog,
				null, false);
	}

	private void setOnClickListener() {
		setButton(AlertDialog.BUTTON_POSITIVE, "Add", new OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {

				EditText tagForm = (EditText) mRootView
						.findViewById(R.id.tag_registration_edittext);
				String newTagName = tagForm.getText().toString();

				mListener.onAddClicked(newTagName);
			}
		});
	}

}
