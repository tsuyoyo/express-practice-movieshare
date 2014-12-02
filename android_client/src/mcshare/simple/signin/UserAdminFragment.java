/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.signin;

import java.util.List;

import mcshare.simple.common.FragmentBase;
import mcshare.simple.tasks.user.User;
import mcshare.simple.tasks.user.UserDeleteTask;
import mcshare.simple.tasks.user.UserGetAllTask;
import mcshare.simple.tasks.user.UserRegisterTask;
import mcshare.simple.tasks.user.UserDeleteTask.IUserDeleteListener;
import mcshare.simple.tasks.user.UserGetAllTask.IUserAllGetterListener;
import mcshare.simple.tasks.user.UserRegisterTask.IUserRegisterListener;
import mcshare.test.R;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;

public class UserAdminFragment extends FragmentBase {

	private User mSelectedUser;

	private UserSpinnerAdapter mUserListAdapter;

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		View rootView = inflater.inflate(R.layout.user_admin_fragment,
				container, false);

		// Category area
		setupUserMenuArea(rootView);

		return rootView;
	}

	private void updateUserList() {
		IUserAllGetterListener listener = new IUserAllGetterListener() {

			@Override
			public void onComplete(List<User> users) {
				mUserListAdapter.setData(users);
				mUserListAdapter.notifyDataSetChanged();
			}
		};
		UserGetAllTask task = new UserGetAllTask(listener, getActivity());
		task.execute();
	}

	private void submitUser(final EditText nameForm, EditText registrationForm) {

		String name = nameForm.getText().toString();
		String key = registrationForm.getText().toString();

		if (0 == name.length() || 0 == key.length()) {
			return;
		}

		IUserRegisterListener listener = new IUserRegisterListener() {
			@Override
			public void onComplete(User newUser) {
				if (null != newUser) {
					nameForm.setText("");
					mUserListAdapter.addData(newUser);
					updateUserList();
					dismissWaitDialog();
				} else {
					showErrorDialog("Failed to register");
					dismissWaitDialog();
				}
			}
		};

		showWaitDialog();
		UserRegisterTask task = new UserRegisterTask(listener, getActivity());
		task.execute(name, key);
	}

	private void setupUserMenuArea(final View rootView) {

		// User registration button.
		Button registerBtn = (Button) rootView
				.findViewById(R.id.user_registration_btn_submit);
		registerBtn.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				EditText nameForm = (EditText) rootView
						.findViewById(R.id.user_registration_name_form);
				EditText keyForm = (EditText) rootView
						.findViewById(R.id.user_registration_key_form);
				submitUser(nameForm, keyForm);
			}
		});

		// User selector
		mUserListAdapter = new UserSpinnerAdapter(getActivity());
		Spinner userSpinner = (Spinner) rootView
				.findViewById(R.id.user_name_list_spinner);
		userSpinner.setAdapter(mUserListAdapter);
		userSpinner.setOnItemSelectedListener(new OnItemSelectedListener() {

			@Override
			public void onItemSelected(AdapterView<?> adapter, View view,
					int position, long arg3) {
				mSelectedUser = (User) adapter.getSelectedItem();
			}

			@Override
			public void onNothingSelected(AdapterView<?> arg0) {
				mSelectedUser = null;
			}
		});
		updateUserList();

		// User delete button
		Button userDeleteBtn = (Button) rootView
				.findViewById(R.id.user_unregistration_btn_delete);
		userDeleteBtn.setOnClickListener(new OnClickListener() {

			IUserDeleteListener listener = new IUserDeleteListener() {
				@Override
				public void onComplete(Integer result) {
					mSelectedUser = null;
					updateUserList();
					dismissWaitDialog();
				}
			};

			@Override
			public void onClick(View v) {
				UserDeleteTask task = new UserDeleteTask(mSelectedUser.id,
						listener, getActivity());
				if (null != mSelectedUser) {
					showWaitDialog();
					task.execute();
				}
			}
		});
	}
}
