/****************************************************************************
**
** Copyright (C) 2014 Klaralvdalens Datakonsult AB (KDAB).
** Copyright (C) 2017 The Qt Company Ltd.
** Contact: https://www.qt.io/licensing/
**
** This file is part of the Qt3D module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:BSD$
** Commercial License Usage
** Licensees holding valid commercial Qt licenses may use this file in
** accordance with the commercial license agreement provided with the
** Software or, alternatively, in accordance with the terms contained in
** a written agreement between you and The Qt Company. For licensing terms
** and conditions see https://www.qt.io/terms-conditions. For further
** information use the contact form at https://www.qt.io/contact-us.
**
** BSD License Usage
** Alternatively, you may use this file under the terms of the BSD license
** as follows:
**
** "Redistribution and use in source and binary forms, with or without
** modification, are permitted provided that the following conditions are
** met:
**   * Redistributions of source code must retain the above copyright
**     notice, this list of conditions and the following disclaimer.
**   * Redistributions in binary form must reproduce the above copyright
**     notice, this list of conditions and the following disclaimer in
**     the documentation and/or other materials provided with the
**     distribution.
**   * Neither the name of The Qt Company Ltd nor the names of its
**     contributors may be used to endorse or promote products derived
**     from this software without specific prior written permission.
**
**
** THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
** "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
** LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
** A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
** OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
** LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
** DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
** THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
** (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
** OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
**
** $QT_END_LICENSE$
**
****************************************************************************/

uniform highp mat4 viewMatrix;

uniform highp vec3 lightPosition;
uniform highp vec3 lightIntensity;

uniform highp vec3 ka;            // Ambient reflectivity
uniform highp vec3 ks;            // Specular reflectivity
uniform highp float shininess;    // Specular shininess factor
uniform highp float opacity;      // Alpha channel

uniform sampler2D diffuseTexture;
uniform sampler2D normalTexture;

varying highp vec4 positionInLightSpace;

varying highp vec3 lightDir;
varying highp vec3 viewDir;
varying highp vec2 texCoord;

highp vec3 dbModel(const highp vec3 norm, const highp vec2 flipYTexCoord)
{
    // Reflection of light direction about normal
    highp vec3 r = reflect(-lightDir, norm);

    highp vec3 diffuseColor = texture2D(diffuseTexture, flipYTexCoord).rgb;

    // Calculate the ambient contribution
    highp vec3 ambient = lightIntensity * ka * diffuseColor;

    // Calculate the diffuse contribution
    highp float sDotN = max(dot(lightDir, norm), 0.0);
    highp vec3 diffuse = lightIntensity * diffuseColor * sDotN;

    // Calculate the specular highlight contribution
    highp vec3 specular = vec3(0.0);
    if (sDotN > 0.0)
        specular = (lightIntensity * ks) * pow(max(dot(r, viewDir), 0.0), shininess);

    return ambient + diffuse + specular;
}

void main()
{
    highp vec2 flipYTexCoord = texCoord;
    flipYTexCoord.y = 1.0 - texCoord.y;

    highp vec4 normal = 2.0 * texture2D(normalTexture, flipYTexCoord) - vec4(1.0);

    highp vec3 result = dbModel(normalize(normal.xyz), flipYTexCoord);

    gl_FragColor = vec4(result, opacity);
}
