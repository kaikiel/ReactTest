/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, Alert, Button, Image, View} from 'react-native';


import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import { LoginButton, AccessToken, LoginManager } from 'react-native-fbsdk';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      error: null,
    };
  }

  getCurrentUserInfo = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({ userInfo });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        // user has not signed in yet
      } else {
        // some other error
      }
    }
  };

  isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    this.setState({ isLoginScreenPresented: !isSignedIn });
  };

  _signOut = async () => {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();

        this.setState({ userInfo: null, error: null });
      } catch (error) {
        this.setState({
          error,
        });
      }
    };

  _signIn = async () => {
      try {
        await GoogleSignin.hasPlayServices();
        GoogleSignin.configure();
        const userInfo = await GoogleSignin.signIn();
        console.log(JSON.stringify(userInfo));
        //console.warn(userInfo.user.name);
        this.setState({ userInfo, error: null });
      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // sign in was cancelled
          Alert.alert('cancelled');
        } else if (error.code === statusCodes.IN_PROGRESS) {
          // operation in progress already
          Alert.alert('in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert('play services not available or outdated');
        } else {
          Alert.alert('Something went wrong', error.toString());
          this.setState({
            error,
          });
        }
      }
    };

    renderUserInfo() {
      const { userInfo } = this.state;

      return (
        <View style={styles.container}>
          <Image
            style={{ borderRadius:100, width: 80, height: 80}}
            source={{uri: userInfo.user.photo}}
          />

          <Text style={{  fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
            Welcome {userInfo.user.name}
          </Text>
          <Text style={{ marginBottom: 20 }}>Your Email: {userInfo.user.email}</Text>

          <Button onPress={this._signOut} title="Log out" />
        </View>
      );
    }

    initUser(token) {
      fetch('https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' + token)
      .then((response) => response.json())
      .then((json) => {
        // Some user object has been set up somewhere, build that user here

        console.warn(json)
        console.warn(json.name)
      })
      .catch(() => {
        console.log('ERROR GETTING DATA FROM FACEBOOK')
      })
    }

    
    renderSignInButton() {
      return (
        <View style={styles.container}>
          <GoogleSigninButton style={{ width: 312, height: 48 }}
                              size={GoogleSigninButton.Size.Wide}
                              color={GoogleSigninButton.Color.Dark}
                              onPress={this._signIn}
                              />

          <LoginButton
            onLoginFinished={
              (error, result) => {
                if (error) {
                  console.warn("login has error: " + JSON.stringify(result) + error);
                } else if (result.isCancelled) {
                  console.warn("login is cancelled.");
                } else {
                  AccessToken.getCurrentAccessToken().then(
                    (data) => {
                      console.warn(data.accessToken.toString())
                      this.initUser(data.accessToken.toString())
                      console.warn(data)
                      console.log(data)
                    }
                  )
                }
              }
            }
            onLogoutFinished={() => console.log("logout.")}/>
        </View>
      );
    }

    async componentDidMount() {
      this._configureGoogleSignIn();
      await this._getCurrentUser();
    }

    _configureGoogleSignIn() {
      GoogleSignin.configure();
    }

    async _getCurrentUser() {
      try {
        const userInfo = await GoogleSignin.signInSilently();
        this.setState({ userInfo, error: null });
      } catch (error) {
        const errorMessage =
          error.code === statusCodes.SIGN_IN_REQUIRED ? 'Please sign in :)' : error.message;
        this.setState({
          error: errorMessage,
        });
      }
    }



  render() {
    const { userInfo } = this.state;
    const body = userInfo ? this.renderUserInfo() : this.renderSignInButton();
    //console.warn(JSON.stringify(userInfo));
    return (
      <View style={[styles.container, { flex: 1 }]}>

        {body}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
