/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.signin;

import java.util.List;

import mcshare.simple.MainActivity;
import mcshare.simple.common.CommonConsts;
import mcshare.simple.host.HostChangeDialog;
import mcshare.simple.tasks.user.User;
import mcshare.simple.tasks.user.UserAuthenticateTask;
import mcshare.simple.tasks.user.UserAuthenticateTask.OnAuthenticateListener;
import mcshare.simple.tasks.user.UserGetAllTask;
import mcshare.simple.tasks.user.UserGetAllTask.IUserAllGetterListener;
import mcshare.simple.tasks.user.UserRegisterTask;
import mcshare.simple.tasks.user.UserRegisterTask.IUserRegisterListener;
import mcshare.test.R;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

public class SigninActivity extends Activity {

	private CheckBox mAdminRegisterCheck;

	private User mSelectedUser;

	private UserSpinnerAdapter mUserListAdapter;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Parse content ID which should be passed.
		if (null == getIntent().getExtras()
				|| null == getIntent().getExtras().get(Intent.EXTRA_STREAM)) {
			Toast.makeText(this, "No content is specified", Toast.LENGTH_SHORT)
					.show();
			finish();
		} else {
			if (CommonConsts.IS_SPECIFIC_PURPOSE) {
				// 固定のメールアドレスとパスワードで次の画面へ
				startMainActivityAfterAuthentication(
						CommonConsts.SPECIFIC_MAIL_ADDR,
						CommonConsts.SPECIFIC_PASSWORD);
			} else {
				setContentView(R.layout.signin_layout);

				setupAdminCheck();
				setupUserList();
				setupSigninButton();
				setupRegisterButton();
			}
		}
	}

	private void setupAdminCheck() {
		mAdminRegisterCheck = (CheckBox) findViewById(R.id.user_registration_admin_check);
		mAdminRegisterCheck
				.setOnCheckedChangeListener(new OnCheckedChangeListener() {

					@Override
					public void onCheckedChanged(CompoundButton buttonView,
							boolean isChecked) {
						toggleAdminKeyForm(
								R.id.user_registration_admin_key_layout,
								isChecked);
					}
				});
	}

	private void toggleAdminKeyForm(int id, boolean isChecked) {

		View keyForm = findViewById(id);
		if (isChecked) {
			keyForm.setVisibility(View.VISIBLE);
		} else {
			((EditText) findViewById(R.id.signin_admin_key_form)).setText("");
			keyForm.setVisibility(View.GONE);
		}
	}

	private void setupUserList() {

		mUserListAdapter = new UserSpinnerAdapter(this);

		Spinner userSpinner = (Spinner) findViewById(R.id.signin_user_list);
		userSpinner.setAdapter(mUserListAdapter);
		userSpinner.setOnItemSelectedListener(new OnItemSelectedListener() {

			@Override
			public void onItemSelected(AdapterView<?> adapter, View view,
					int position, long arg3) {
				mSelectedUser = (User) adapter.getSelectedItem();

				if (mSelectedUser.type.equals("admin")) {
					toggleAdminKeyForm(R.id.signin_admin_key_layout, true);
				} else {
					toggleAdminKeyForm(R.id.signin_admin_key_layout, false);
				}
			}

			@Override
			public void onNothingSelected(AdapterView<?> arg0) {
				mSelectedUser = null;
			}
		});

		if (0 < mUserListAdapter.getCount()) {
			userSpinner.setSelection(0);
		}

		final ProgressDialog dialog = new ProgressDialog(this,
				ProgressDialog.STYLE_SPINNER);
		dialog.setMessage("Loading...");

		IUserAllGetterListener listener = new IUserAllGetterListener() {

			@Override
			public void onComplete(List<User> users) {
				dialog.dismiss();
				mUserListAdapter.setData(users);
				mUserListAdapter.notifyDataSetChanged();
			}
		};

		dialog.show();

		UserGetAllTask task = new UserGetAllTask(listener, this);
		task.execute();
	}

	private void setupSigninButton() {

		Button signinBtn = (Button) findViewById(R.id.signin_btn);

		signinBtn.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {

				boolean isAdmin = mSelectedUser.type.equals("admin");

				String adminKey = isAdmin ? getInputString(R.id.signin_admin_key_form)
						: null;
				String mail = mSelectedUser.mail;

				startMainActivityAfterAuthentication(mail, adminKey);
			}
		});
	}

	private void startMainActivityAfterAuthentication(String mail,
			String adminKey) {
		OnAuthenticateListener listener = new OnAuthenticateListener() {

			@Override
			public void onComplete(User res) {
				if (null != res) {
					startMainActivity(res);
				} else {
					Toast.makeText(SigninActivity.this, "Failed to sign in",
							Toast.LENGTH_SHORT).show();
				}
			}
		};

		UserAuthenticateTask task = new UserAuthenticateTask(mail, adminKey,
				listener, SigninActivity.this);
		task.execute();
	}

	private void setupRegisterButton() {

		Button registerBtn = (Button) findViewById(R.id.user_registration_btn_register);
		registerBtn.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {

				final ProgressDialog dialog = new ProgressDialog(
						SigninActivity.this, ProgressDialog.STYLE_SPINNER);

				IUserRegisterListener listener = new IUserRegisterListener() {
					@Override
					public void onComplete(User newUser) {
						dialog.dismiss();

						if (null != newUser) {
							startMainActivity(newUser);
						} else {
							Toast.makeText(SigninActivity.this,
									"Error happens during registration",
									Toast.LENGTH_SHORT).show();
						}
					}
				};

				dialog.setMessage("Registering...");
				dialog.show();

				UserRegisterTask task = new UserRegisterTask(listener,
						SigninActivity.this);

				String name = getInputString(R.id.user_registration_name_form);
				String mail = getInputString(R.id.user_registration_mail_form);
				String team = getInputString(R.id.user_registration_team_form);

				boolean isAdmin = mAdminRegisterCheck.isChecked();

				String type = (isAdmin) ? "admin" : "user";
				String adminRegisterKey = (isAdmin) ? getInputString(R.id.user_registration_admin_key_form)
						: null;
				String registerKey = "mcshare";

				task.execute(name, mail, team, type, adminRegisterKey,
						registerKey);
			}

		});

	}

	private String getInputString(int id) {
		EditText editText = (EditText) findViewById(id);
		return editText.getEditableText().toString();
	}

	private void startMainActivity(User user) {

		Intent intent = new Intent(this, MainActivity.class);

		intent.putExtra(MainActivity.EXTRA_USER_ID, user.id);
		intent.putExtra(MainActivity.EXTRA_USER_NAME, user.name);
		intent.putExtras(getIntent().getExtras());

		// When back from mainActivity, it'll shutdown immediately
		startActivityForResult(intent, 100);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		finish();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		menu.add(0, Menu.FIRST, Menu.NONE, "Host settings");

		return super.onCreateOptionsMenu(menu);
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		case Menu.FIRST:
			HostChangeDialog hostDialog = HostChangeDialog.getInstance(this);
			hostDialog.show();
			break;
		}
		return super.onOptionsItemSelected(item);
	}

}
