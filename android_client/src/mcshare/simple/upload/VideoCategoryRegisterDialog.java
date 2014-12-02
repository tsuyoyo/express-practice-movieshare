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
import android.widget.CheckBox;
import android.widget.EditText;

public class VideoCategoryRegisterDialog extends AlertDialog {

	public static VideoCategoryRegisterDialog getInstance(Context context,
			VideoCategoryRegisterDialog.IListener listener) {

		return new VideoCategoryRegisterDialog(context, listener);
	}

	public interface IListener {
		public void onAddClicked(String categoryName, boolean isPublic);
	}

	private IListener mListener;

	protected VideoCategoryRegisterDialog(Context context,
			VideoCategoryRegisterDialog.IListener listener) {

		super(context);

		mListener = listener;

		createView();

		setTitle("Add new category");
		setView(mRootView);
		setOnClickListener();
	}

	private View mRootView;

	private void createView() {

		mRootView = getLayoutInflater().inflate(
				R.layout.category_register_dialog, null, false);
	}

	private void setOnClickListener() {

		setButton(AlertDialog.BUTTON_POSITIVE, "Add", new OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {

				EditText categoryForm = (EditText) mRootView
						.findViewById(R.id.category_registration_edittext);
				String newCategoryName = categoryForm.getText().toString();

				CheckBox checkbox = (CheckBox) mRootView
						.findViewById(R.id.category_registration_ispublic);
				boolean isPublic = checkbox.isChecked();

				mListener.onAddClicked(newCategoryName, isPublic);
			}
		});
	}

}
