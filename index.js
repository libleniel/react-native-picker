'use strict';

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Animated,
    Platform,
    Dimensions,
    TouchableOpacity,
    ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';
import PickerAndroid from 'react-native-picker-android';
import PickerIOS from '../../App/Components/Picker/PickerIOS'

let Picker = Platform.OS === 'ios' ? PickerIOS : PickerAndroid;
let PickerItem = Picker.Item;
let {width, height} = Dimensions.get('window');

const longSide = width > height ? width : height;
const shortSide = width > height ? height : width;

export default class PickerAny extends Component {

    static propTypes = {
        style: ViewPropTypes.style,
        pickerElevation: PropTypes.number,
        pickerBtnText: PropTypes.string,
        pickerCancelBtnText: PropTypes.string,
        pickerBtnStyle: Text.propTypes.style,
        pickerTitle: PropTypes.string,
        pickerTitleStyle: Text.propTypes.style,
        pickerToolBarStyle: ViewPropTypes.style,
        showMask: PropTypes.bool,
        showDuration: PropTypes.number,
        pickerData: PropTypes.any.isRequired,
        imagesData: PropTypes.any,
        selectedValue: PropTypes.any.isRequired,
        onPickerDone: PropTypes.func,
        onPickerCancel: PropTypes.func,
        onValueChange: PropTypes.func,
        allowFontScaling: PropTypes.bool,
    };

    static defaultProps = {
        style: {
            width: width
        },
        pickerBtnText: 'Done',
        pickerCancelBtnText: 'Cancel',
        showMask: false,
        showDuration: 300,
        onPickerDone: ()=>{},
        onPickerCancel: ()=>{},
        onValueChange: ()=>{},
        allowFontScaling: true,
        imagesData: [],
    };

    constructor(props, context) {
        super(props, context);

        let pickerStyle = PickerAny.getPickerStyle(props)

        this.state = PickerAny._getStateFromProps(props, null, pickerStyle);
    }

    static getDerivedStateFromProps(props, state) {
        let p_selectedValue = props.selectedValue;
        let isNeedToResetPicker = props.isNeedToResetPicker;

        let s_selectedValue = state.selectedValue;

        let pickerStyle = PickerAny.getPickerStyle(props)

        var isChanged = false

        if (p_selectedValue && s_selectedValue) {
            if (pickerStyle == 'parallel') {
                if (p_selectedValue.constructor !== Array) {
                    p_selectedValue = [p_selectedValue];
                }

                if (p_selectedValue.length == s_selectedValue.length) {
                    for (let i = 0; i < p_selectedValue.length; i++) { 
                      if (p_selectedValue[i] != s_selectedValue[i]) {
                        isChanged = true

                        break
                      }
                    }
                } else {
                    isChanged = true
                }
            } else {
                if (
                    state.thirdWheelData && 
                    (
                        p_selectedValue[0] != s_selectedValue[0] || 
                        p_selectedValue[1] != s_selectedValue[1] || 
                        p_selectedValue[2] != s_selectedValue[2]
                    )
                ) {
                    isChanged = true
                } else if (p_selectedValue[0] != s_selectedValue[0] || p_selectedValue[1] != s_selectedValue[1]) {
                    isChanged = true
                }
            }
        } else {           
            isChanged = true
        }

        if (isChanged || isNeedToResetPicker) {
            props.isFinishResetPicker && props.isFinishResetPicker()

            return PickerAny._getStateFromProps(props, state, pickerStyle);
        }        

        return null
    }

    static getPickerStyle (props) {
        let {pickerData} = props;

        return pickerData.constructor === Array ? 'parallel' : 'cascade';
    }

    static _getStateFromProps(props, state, pickerStyle) {
        let {pickerData, selectedValue, imagesData} = props;

        let firstWheelData;
        let firstPickedData;

        let secondWheelData;
        let secondPickedDataIndex;

        let thirdWheelData;
        let thirdPickedDataIndex;

        let cascadeData = {};

        let slideAnim = (state && state.slideAnim ? state.slideAnim : new Animated.Value(-height));

        if (pickerStyle === 'parallel') {
            //compatible single wheel sence
            if (selectedValue.constructor !== Array) {
                selectedValue = [selectedValue];
            }

            if (pickerData[0].constructor !== Array) {
                pickerData = [pickerData];
            }
        } else if (pickerStyle === 'cascade') {
            //only support three stage
            firstWheelData = Object.keys(pickerData);
            firstPickedData = selectedValue[0];

            let secondPickedData = selectedValue[1];

            cascadeData = PickerAny._getCascadeData(pickerData, firstPickedData, secondPickedData, true);
        }

        return {
            ...props,
            //Picker Property
            pickerStyle,
            imagesData,
            slideAnim,
            //Picker Data
            pickerData,
            //Selected Value
            selectedValue,
            //First Wheel Data
            firstWheelData,
            firstPickedData,
            //Second Wheel Data
            secondWheelData: cascadeData.secondWheelData,
            //Third Wheel Data
            thirdWheelData: cascadeData.thirdWheelData,
        };
    }

    static _getCascadeData(pickerData, firstPickedData, secondPickedData, onInit) {
        let secondWheelData;
        let thirdWheelData;
        //only support two and three stage
        for (let key in pickerData) { //two stage
            if (pickerData[key].constructor === Array){
                secondWheelData = pickerData[firstPickedData];

                break;
            } else{ //three stage
                secondWheelData = Object.keys(pickerData[firstPickedData]);
                thirdWheelData = pickerData[firstPickedData][secondPickedData];

                break;
            }
        }

        return {
            secondWheelData,
            thirdWheelData,
        }
    }

    shouldComponentUpdate(nextProps, nextState, context){
        return true;
    }

    _slideUp(){
        this._isMoving = true;
        Animated.timing(
            this.state.slideAnim,
            {
                toValue: 0,
                duration: this.state.showDuration,
            }
        ).start((evt) => {
            if(evt.finished) {
                this._isMoving = false;
                this._isPickerShow = true;
            }
        });
    }

    _slideDown(){
        this._isMoving = true;
        Animated.timing(
            this.state.slideAnim,
            {
                toValue: -height,
                duration: this.state.showDuration,
            }
        ).start((evt) => {
            if(evt.finished) {
                this._isMoving = false;
                this._isPickerShow = false;
            }
        });
    }

    _toggle(){
        if(this._isMoving) {
            return;
        }
        if(this._isPickerShow) {
            this._slideDown();
        }
        else{
            this._slideUp();
        }
    }
    
    toggle(){
        this._toggle();
    }
    show(){
        if(!this._isPickerShow){
            this._slideUp();
        }
    }
    hide(){
        if(this._isPickerShow){
            this._slideDown();
        }
    }
    isPickerShow(){
        return this._isPickerShow;
    }

    _prePressHandle(callback){
        this.pickerWheel.moveUp();
    }

    _nextPressHandle(callback){
        this.pickerWheel.moveDown();
    }

    _pickerCancel(){
        this._toggle();
        this.state.onPickerCancel();
    }

    _pickerFinish(){
        this._toggle();

        this.state.onPickerDone(this.state.selectedValue, true);
    }

    _renderParallelWheel(pickerData){
        return pickerData.map((item, index) => {
            return (
                <View style={styles.pickerWheel} key={index}>
                    <Picker
                        selectedValue={this.state.selectedValue[index]}
                        onValueChange={(value, idx) => {
                            var latestSelectedValue = this.state.selectedValue
                            latestSelectedValue.splice(index, 1, value);

                            this.state.onValueChange(latestSelectedValue);
                        }}>
                        {item.map((value, index) => (
                            <PickerItem
                                key={index}
                                value={value}
                                label={value.toString()}
                                image={this.state.imagesData[index]?this.state.imagesData[index]:null}
                            />)
                        )}
                    </Picker>
                </View>
            );
        });
    }

    _renderCascadeWheel(pickerData) {
        let thirdWheel = this.state.thirdWheelData && (
            <View style={styles.pickerWheel}>
                <Picker
                    ref={'thirdWheel'}
                    selectedValue={this.state.selectedValue[2]}
                    onValueChange={(value, index) => {
                        var latestSelectedValue = this.state.selectedValue
                        latestSelectedValue.splice(2, 1, value);

                        this.state.onValueChange(latestSelectedValue, false);
                    }} >
                    {this.state.thirdWheelData.map((value, index) => (
                        <PickerItem
                            key={index}
                            value={value}
                            label={value.toString()}
                        />)
                    )}
                </Picker>
            </View>
        );

        return (
            <View style={[styles.pickerWrap, {width: this.state.style.width || width}]}>
                <View style={styles.pickerWheel}>
                    <Picker
                        ref={'firstWheel'}
                        selectedValue={this.state.selectedValue[0]}
                        onValueChange={(value, index) => {
                            var latestSelectedValue = this.state.selectedValue

                            let secondWheelData = pickerData[value];
                            let secondPickedData = secondWheelData[0]
                            
                            let cascadeData = PickerAny._getCascadeData(pickerData, value, secondPickedData);

                            if (!cascadeData.thirdWheelData) { //Two Stage
                                latestSelectedValue.splice(0, 2, value, cascadeData.secondWheelData[0]);
                            } else { // Three Stage
                                latestSelectedValue.splice(0, 3, value, cascadeData.secondWheelData[0], cascadeData.thirdWheelData[0]);
                            }

                            this.state.onValueChange(latestSelectedValue, true);
                        }}>
                        {this.state.firstWheelData.map((value, index) => (
                            <PickerItem
                                key={index}
                                value={value}
                                label={value.toString()}
                            />)
                        )}
                    </Picker>
                </View>
                <View style={styles.pickerWheel}>
                    <Picker
                        ref={'secondWheel'}
                        selectedValue={this.state.selectedValue[1]}
                        onValueChange={(value, index) => {
                            let latestSelectedValue = this.state.selectedValue

                            let cascadeData = PickerAny._getCascadeData(pickerData, this.state.firstPickedData, value);

                            if (!cascadeData.thirdWheelData) { //Two Stage
                                latestSelectedValue.splice(1, 1, value);
                            } else { //Three Stage
                                latestSelectedValue.splice(1, 2, value, cascadeData.thirdWheelData[0]);
                            }

                            this.state.onValueChange(latestSelectedValue, !cascadeData.thirdWheelData ? false : true);
                        }}>
                        {this.state.secondWheelData.map((value, index) => (
                            <PickerItem
                                key={index}
                                value={value}
                                label={value.toString()}
                            />)
                        )}
                    </Picker>
                </View>
                {thirdWheel}
            </View>
        );
    }

    _renderWheel(pickerData){
        let wheel = null;
        if(this.state.pickerStyle === 'parallel'){
            wheel = this._renderParallelWheel(pickerData);
        }
        else if(this.state.pickerStyle === 'cascade'){
            wheel = this._renderCascadeWheel(pickerData);
        }
        return wheel;
    }

    render(){

        let mask = this.state.showMask ? (
            <View style={styles.mask} >
                <Text allowFontScaling={this.props.allowFontScaling} style={{width: width, height: height}} onPress={this._pickerCancel.bind(this)}></Text>
            </View>
        ) : null;

        return (
            <Animated.View style={[styles.picker, {
                elevation: this.state.pickerElevation,
                width: longSide,
                height: this.state.showMask ? height : this.state.style.height,
                bottom: this.state.slideAnim
            }]}>
                {mask}
                <View style={[styles.pickerBox, this.state.style]}>
                    <View style={[styles.pickerToolbar, this.state.pickerToolBarStyle, {width: this.state.style.width || width}]}>
                        <TouchableOpacity style={styles.pickerCancelBtn} onPress={this._pickerCancel.bind(this)}>
                            <Text allowFontScaling={this.props.allowFontScaling} style={[styles.pickerFinishBtnText, this.state.pickerBtnStyle]}>{this.state.pickerCancelBtnText}</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={this.props.allowFontScaling} style={[styles.pickerTitle, this.state.pickerTitleStyle]} numberOfLines={1}>
                            {this.state.pickerTitle}
                        </Text>
                        <TouchableOpacity style={styles.pickerFinishBtn} onPress={this._pickerFinish.bind(this)}>
                            <Text allowFontScaling={this.props.allowFontScaling} style={[styles.pickerFinishBtnText, this.state.pickerBtnStyle]}>{this.state.pickerBtnText}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.pickerWrap, {width: this.state.style.width || width}]}>
                        {this._renderWheel(this.state.pickerData)}
                    </View>
                </View>
            </Animated.View>
        );
    }
};

let styles = StyleSheet.create({
    picker: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'transparent',
    },
    pickerBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#bdc0c7'
    },
    mask: {
        position: 'absolute',
        top: 0,
        backgroundColor: 'transparent',
        height: height,
        width: width
    },
    pickerWrap: {
        flexDirection: 'row'
    },
    pickerWheel: {
        flex: 1
    },
    pickerToolbar: {
        height: 30,
        backgroundColor: '#e6e6e6',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#c3c3c3',
        alignItems: 'center'
    },
    pickerBtnView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    pickerMoveBtn: {
        color: '#149be0',
        fontSize: 16,
        marginLeft: 20
    },
    pickerCancelBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 5,
        paddingBottom: 5,
    },
    pickerTitle: {
        flex: 4,
        color: 'black',
        textAlign: 'center'
    },
    pickerFinishBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 5,
        paddingBottom: 5,
    },
    pickerFinishBtnText: {
        fontSize: 16,
        color: '#149be0'
    }
});