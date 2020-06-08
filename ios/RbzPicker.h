//
//  Picker.h
//  RNPicker
//
//  Created by nendy.reebonz on 1/29/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <React/UIView+React.h>

@interface RbzPicker : UIPickerView

@property (nonatomic, copy) NSArray<NSDictionary *> *items;
@property (nonatomic, assign) NSInteger selectedIndex;

@property (nonatomic, strong) UIColor *color;
@property (nonatomic, strong) UIFont *font;
@property (nonatomic, assign) NSTextAlignment textAlign;

@property (nonatomic, copy) RCTBubblingEventBlock onChange;

@end
