/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.common;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.support.v4.app.Fragment;

public class FragmentBase extends Fragment {

	private ProgressDialog mDialog;

	protected void showWaitDialog() {
		if (null != mDialog) {
			mDialog.dismiss();
		}
		mDialog = new ProgressDialog(getActivity(),
				ProgressDialog.STYLE_SPINNER);
		mDialog.setMessage("Please wait...");
		mDialog.setCancelable(false);
		mDialog.show();
	}

	protected void dismissWaitDialog() {
		if (null != mDialog) {
			mDialog.dismiss();
			mDialog = null;
		}
	}

	protected void showErrorDialog(String errMessage) {
		AlertDialog.Builder dialogBuilder = new AlertDialog.Builder(
				getActivity());
		AlertDialog dialog = dialogBuilder.setCancelable(true)
				.setMessage(errMessage).setTitle("Error happens").create();
		dialog.show();
	}

}
